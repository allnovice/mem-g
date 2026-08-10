export interface PlayerStats {
    displayName: string
    flips: number
    matches: number
}

export default class PlayerManager {
    private players = new Map<string, PlayerStats>()

    getOrCreate(
        playerId: string,
        displayName: string
    ): PlayerStats {
        let player = this.players.get(playerId)

        if (!player) {
            player = {
                displayName,
                flips: 0,
                matches: 0,
            }

            this.players.set(playerId, player)
        }

        return player
    }

    get(
        playerId: string
    ): PlayerStats | undefined {
        return this.players.get(playerId)
    }

addFlip(
    playerId: string
): PlayerStats {
    const player = this.players.get(playerId)

    if (!player) {
        throw new Error(
            `Player not found: ${playerId}`
        )
    }

        player.flips++

        return player
    }

addMatch(
    playerId: string
): PlayerStats {
    const player = this.players.get(playerId)

    if (!player) {
        throw new Error(
            `Player not found: ${playerId}`
        )
    }

    player.matches++

    return player
}

    getTopPlayers(limit = 3) {
        return Array.from(
            this.players.entries()
        )
            .sort(
                (a, b) =>
                    b[1].matches -
                    a[1].matches
            )
            .slice(0, limit)
            .map(([playerId, stats]) => ({
                playerId,
                displayName: stats.displayName,
                matches: stats.matches,
            }))
    }
}
