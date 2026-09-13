from django.conf import settings
from django.db import models


class Game(models.Model):
    class Status(models.TextChoices):
        WAITING = "waiting"
        ACTIVE = "active"
        FINISHED = "finished"

    class TimeControl(models.IntegerChoices):
        THREE = 3
        FIVE = 5
        TEN = 10

    class Result(models.TextChoices):
        WHITE_WINS = "white_wins"
        BLACK_WINS = "black_wins"
        DRAW = "draw"

    white_player = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="white_games",
        null=True,
        blank=True,
    )

    black_player = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="black_games",
        null=True,
        blank=True,
    )

    fen = models.CharField(max_length=100)

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.WAITING,
    )

    result = models.CharField(
        max_length=10,
        choices=Result.choices,
        null=True,
        blank=True,
    )

    white_time = models.PositiveIntegerField()
    black_time = models.PositiveIntegerField()

    time_control = models.PositiveIntegerField(
        choices=TimeControl.choices,
        default=TimeControl.TEN,
    )

    turn_started_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
