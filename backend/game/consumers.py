from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from .chess_logic import validate_and_apply_move
from .models import Game


class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        url_route = self.scope.get("url_route")

        if not url_route:
            await self.close(code=4000)
            return

        self.game_id = url_route["kwargs"]["game_id"]
        self.user = self.scope.get("user")

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        game = await self.get_game()

        if not game:
            await self.close(code=4004)
            return

        if self.user.id not in [
            game.white_player_id,
            game.black_player_id,
        ]:
            await self.close(code=4003)
            return

        self.player_color = (
            "white"
            if game.white_player_id == self.user.id
            else "black"
        )

        self.game_group_name = f"game_{self.game_id}"

        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name,
        )

        await self.accept()

        await self.start_clock(game)
        clocks = self.calculate_game_clocks(game)

        await self.send_json({
            "type": "game_state",
            "game_id": self.game_id,
            "fen": game.fen,
            "color": self.player_color,
            "status": game.status,
            "white_time": clocks["white_time"],
            "black_time": clocks["black_time"],
        })

    async def disconnect(self, code):
        if hasattr(self, "game_group_name"):
            await self.channel_layer.group_discard(
                self.game_group_name,
                self.channel_name,
            )

    async def receive_json(self, content):
        message_type = content.get("type")

        if message_type == "move":
            await self.handle_move(content)
        elif message_type == "draw":
            await self.handle_draw()
        elif message_type == "draw_response":
            await self.handle_draw_response(content)
        elif message_type == "resign":
            await self.handle_resign()
        else:
            await self.send_json({
                "type": "error",
                "message": "Unknown message type",
            })

    async def handle_move(self, content):
        from_square = content.get("from")
        to_square = content.get("to")
        promotion = content.get("promotion")

        if not from_square or not to_square:
            await self.send_json({
                "type": "error",
                "message": "Move requires from and to",
            })
            return

        game = await self.get_active_game()
        if not game:
            return

        timeout_winner = await self.update_game_clock(game)
        if timeout_winner:
            result = (
                "BLACK_WINS"
                if timeout_winner == "black"
                else "WHITE_WINS"
            )

            await self.end_game(game, result)

            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "game_message",
                    "data": {
                        "type": "game_over",
                        "reason": "timeout",
                        "winner": timeout_winner,
                    },
                },
            )

            return

        result = await self.validate_move(
            game.fen, from_square, to_square, promotion
        )

        if not result["valid"]:
            await self.send_json({
                "type": "error",
                "message": "Illegal move",
            })
            return

        await self.update_game_fen(game, result["new_fen"])

        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "move_made",
                "from": from_square,
                "to": to_square,
                "promotion": promotion,
                "white_time": game.white_time,
                "black_time": game.black_time,
            },
        )

        if result["is_game_over"]:
            winner = result.get("winner")
            reason = "checkmate" if result["is_checkmate"] else "stalemate"

            if winner == "white":
                game_result = "WHITE_WINS"
            elif winner == "black":
                game_result = "BLACK_WINS"
            else:
                game_result = "DRAW"

            await self.end_game(
                game,
                game_result,
            )

            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "game_message",
                    "data": {
                        "type": "game_over",
                        "reason": reason,
                        "winner": winner,
                    }
                }
            )

    async def move_made(self, event):
        await self.send_json({
            "type": "move_made",
            "from": event["from"],
            "to": event["to"],
            "promotion": event.get("promotion"),
            "white_time": event["white_time"],
            "black_time": event["black_time"],
        })

    async def handle_draw(self):
        game = await self.get_active_game()

        if not game:
            return

        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "draw_offer",
                "sender": self.player_color,
            }
        )

    async def draw_offer(self, event):
        if event["sender"] == self.player_color:
            return

        await self.send_json({
            "type": "draw_offer"
        })

    async def handle_draw_response(self, content):
        accepted = content.get("accepted")

        if accepted is None:
            return

        game = await self.get_active_game()

        if not game:
            return

        if accepted:
            await self.end_game(game, "DRAW")

            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "game_message",
                    "data": {
                        "type": "game_over",
                        "reason": "draw",
                        "winner": None,
                    },
                },
            )
        else:
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "draw_declined",
                },
            )

    async def draw_declined(self, event):
        await self.send_json({
            "type": "draw_declined",
        })

    async def handle_resign(self):
        game = await self.get_active_game()

        if not game:
            return

        winner = (
            "black"
            if self.player_color == "white"
            else "white"
        )

        result = (
            "BLACK_WINS"
            if winner == "black"
            else "WHITE_WINS"
        )

        await self.end_game(game, result)

        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_message",
                "data": {
                    "type": "game_over",
                    "reason": "resignation",
                    "winner": winner,
                },
            },
        )

    async def game_message(self, event):
        await self.send_json(event["data"])

    async def get_active_game(self):
        game = await self.get_game()

        if not game:
            return
        if game.status != Game.Status.ACTIVE:
            return

        return game

    @staticmethod
    def calculate_game_clocks(game: Game):
        if game.turn_started_at is None:
            return {
                "white_time": game.white_time,
                "black_time": game.black_time,
                "timeout_winner": None,
                "now": None,
            }

        now = timezone.now()
        elapsed = int(
            (now - game.turn_started_at).total_seconds()
        )

        white_time = game.white_time
        black_time = game.black_time

        if game.fen.split()[1] == "w":
            white_time = max(0, white_time - elapsed)
        else:
            black_time = max(0, black_time - elapsed)

        timeout_winner = None

        if white_time == 0:
            timeout_winner = "black"
        elif black_time == 0:
            timeout_winner = "white"

        return {
            "white_time": white_time,
            "black_time": black_time,
            "timeout_winner": timeout_winner,
            "now": now,
        }

    @database_sync_to_async
    def start_clock(self, game: Game):
        if game.turn_started_at is None:
            game.turn_started_at = timezone.now()

            game.save(update_fields=["turn_started_at"])

    @database_sync_to_async
    def validate_move(self, fen, from_sq, to_sq, promotion=None):
        return validate_and_apply_move(fen, from_sq, to_sq, promotion)

    @database_sync_to_async
    def update_game_clock(self, game: Game):
        clocks = self.calculate_game_clocks(game)

        game.white_time = clocks["white_time"]
        game.black_time = clocks["black_time"]

        if clocks["now"] is not None:
            game.turn_started_at = clocks["now"]

        game.save(
            update_fields=[
                "white_time",
                "black_time",
                "turn_started_at",
            ]
        )

        return clocks["timeout_winner"]

    @database_sync_to_async
    def update_game_fen(self, game, new_fen):
        game.fen = new_fen
        game.save(update_fields=["fen"])

    @database_sync_to_async
    def get_game(self):
        try:
            return Game.objects.get(id=self.game_id)
        except Game.DoesNotExist:
            return None

    @database_sync_to_async
    def end_game(self, game: Game, result: str):
        game.status = Game.Status.FINISHED
        game.result = result

        game.save( update_fields=["status", "result"])
