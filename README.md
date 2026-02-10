# Workout Streak + Badge Minting dApp

Simple MVP flow:

1. Connect wallet (MetaMask)
2. Log workout (type + duration + notes)
3. Store logs in Supabase
4. Mint milestone badge NFT when streak threshold is reached

## Tech stack

- Next.js (App Router, TypeScript)
- viem (wallet + contract calls)
- Supabase (Postgres + RLS + REST)
- Solidity (OpenZeppelin ERC721)

## Project structure

```text
.
|- app/
|  |- api/
|  |  |- workouts/route.ts
|  |  `- streak/route.ts
|  |- page.tsx
|  `- layout.tsx
|- components/
|  |- WorkoutForm.tsx
|  |- StreakCard.tsx
|  `- MintBadgeButton.tsx
|- contracts/
|  `- BadgeMinter.sol
|- lib/
|  |- contract.ts
|  |- eth.ts
|  |- milestones.ts
|  |- streak.ts
|  |- supabaseAdmin.ts
|  |- supabaseClient.ts
|  `- types.ts
|- scripts/
|  `- deploy.ts
|- supabase/
|  `- schema.sql
`- .env.example
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and fill values:

```bash
cp .env.example .env.local
```

3. Create Supabase table:

- Open Supabase SQL editor
- Run `supabase/schema.sql`

4. Deploy contract:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

5. Put deployed address in `.env.local` as `NEXT_PUBLIC_BADGE_CONTRACT`

6. Run app:

```bash
npm run dev
```

## Milestones

- Default milestones: 3, 7, 14, 30 day streaks
- Contract mints one badge per milestone per wallet

## Notes

- Server-side mint endpoint is omitted for simplicity; current flow mints from connected wallet.
- For production, use a backend relayer (Defender / server wallet) if you do not want user-paid gas.
