export interface PlayerStats {
    flips: number
    matches: number
}

export default class PlayerManager {
    private players = new Map<string, PlayerStats>()

    getOrCreate(playerId: string): PlayerStats {
        let player = this.players.get(playerId)

        if (!player) {
            player = {
                flips: 0,
                matches: 0,
            }

            this.players.set(playerId, player)
        }

        return player
    }

    get(playerId: string): PlayerStats | undefined {
        return this.players.get(playerId)
    }

    addFlip(playerId: string): PlayerStats {
        const player = this.getOrCreate(playerId)

        player.flips++

        return player
    }

    addMatch(playerId: string): PlayerStats {
        const player = this.getOrCreate(playerId)

        player.matches++

        return player
    }
}
