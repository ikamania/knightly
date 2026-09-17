import chess


PROMOTION_PIECES = {"q", "r", "b", "n"}


def validate_and_apply_move(
    fen: str,
    from_sq: str,
    to_sq: str,
    promotion: str | None = None,
) -> dict:
    board = chess.Board(fen)

    from_square = chess.parse_square(from_sq)
    to_square = chess.parse_square(to_sq)

    promotion_piece = None
    if promotion is not None:
        if promotion not in PROMOTION_PIECES:
            return {"valid": False}
        promotion_piece = chess.Piece.from_symbol(promotion).piece_type

    move = chess.Move(from_square, to_square, promotion=promotion_piece)

    if move not in board.legal_moves:
        return {"valid": False}

    board.push(move)

    checkmate = board.is_checkmate()
    stalemate = board.is_stalemate()

    winner = None
    if checkmate:
        winner = "white" if board.turn == chess.BLACK else "black"

    return {
        "valid": True,
        "new_fen": board.fen(),
        "is_checkmate": checkmate,
        "is_stalemate": stalemate,
        "is_game_over": stalemate or checkmate,
        "winner": winner,
    }
