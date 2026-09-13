import random

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.db.models import Q

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Game


STARTING_FEN = (
    "rnbqkbnr/pppppppp/8/8/8/8/"
    "PPPPPPPP/RNBQKBNR w KQkq - 0 1"
)


class FindGameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        game_time = request.data.get("game_time")

        if game_time is None:
            return Response(
                {"detail": "game_time is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            game_time = int(game_time)
        except (TypeError, ValueError):
            return Response(
                {"detail": "game_time must be a intiger"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if game_time not in Game.TimeControl.values:
            return Response(
                {"detail": "Invalid game_time"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user

        existing_game = (
            Game.objects
            .filter(
                status__in=[
                    Game.Status.WAITING,
                    Game.Status.ACTIVE,
                ],
            )
            .filter(
                Q(white_player=user) | Q(black_player=user)
            )
            .first()
        )

        if existing_game:
            if existing_game.status == Game.Status.ACTIVE:
                return Response({
                    "matched": True,
                    "game_id": existing_game.id,
                    "white_player": (
                        existing_game.white_player.username
                        if existing_game.white_player
                        else None
                    ),
                    "black_player": (
                        existing_game.black_player.username
                        if existing_game.black_player
                        else None
                    ),
                })

            return Response({
                "matched": False,
                "game_id": existing_game.id,
            })

        with transaction.atomic():
            game = (
                Game.objects
                .select_for_update()
                .filter(
                    status=Game.Status.WAITING,
                    black_player__isnull=True,
                    time_control=game_time,
                )
                .exclude(white_player=user)
                .first()
            )

            if game:
                if random.choice([True, False]):
                    game.black_player = user
                else:
                    game.black_player = game.white_player
                    game.white_player = user

                game.status = Game.Status.ACTIVE
                game.save()

        if game:
            channel_layer = get_channel_layer()

            for player_id in [
                game.white_player_id,
                game.black_player_id,
            ]:
                async_to_sync(channel_layer.group_send)(
                    f"matchmaking_{player_id}",
                    {
                        "type": "matched",
                        "game_id": game.id,
                    },
                )

            return Response({
                "matched": True,
                "game_id": game.id,
                "white_player": game.white_player.username,
                "black_player": game.black_player.username,
            })

        game = Game.objects.create(
            white_player=user,
            fen=STARTING_FEN,
            status=Game.Status.WAITING,
            time_control=game_time,
            white_time=game_time * 60,
            black_time=game_time * 60,
        )

        return Response(
            {
                "matched": False,
                "game_id": game.id,
            },
            status=status.HTTP_201_CREATED,
        )


class GameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, game_id):
        try:
            game = Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return Response(
                {"detail": "Game not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            game.white_player != request.user
            and game.black_player != request.user
        ):
            return Response(
                {"detail": "You are not part of this game"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({
            "id": game.id,
            "status": game.status,
            "white_player": (
                game.white_player.username
                if game.white_player
                else None
            ),
            "black_player": (
                game.black_player.username
                if game.black_player
                else None
            ),
            "fen": game.fen,
        })


class CancelGameView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, game_id):
        try:
            game = Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return Response(
                {"detail": "Game not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if game.white_player != request.user:
            return Response(
                {"detail": "You cannot cancel this game"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if game.status != Game.Status.WAITING:
            return Response(
                {"detail": "Game is no longer waiting"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        game.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
