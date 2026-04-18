# senditwithcelo-sdk

Minimal TypeScript SDK for the [senditwithcelo](https://github.com/uniquebeing-base-eth/senditwithcelo) app.
Wraps the core on-chain interactions used by the app on the Celo blockchain.

## Install

```bash
npm install senditwithcelo-sdk viem
```

`viem` is a peer-style runtime dependency — the SDK accepts your existing
`PublicClient` / `WalletClient` so it integrates cleanly with apps that already
use viem (e.g. via wagmi).

## Exports

```ts
import {
  sendTip,
  getBalance,
  CELOTIP_ADDRESS,
  CELO_TOKENS,
  CELO_CHAIN_ID,
} from "senditwithcelo-sdk";
```

> The current senditwithcelo app does not implement a `claimReward` flow, so
> it is intentionally not exported. It can be added later when the contract
> ships that function.

## Usage

### `getBalance`

Reads an ERC20 token balance.

```ts
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { getBalance, CELO_TOKENS } from "senditwithcelo-sdk";

const publicClient = createPublicClient({ chain: celo, transport: http() });
const cUSD = CELO_TOKENS.find((t) => t.symbol === "cUSD")!;

const balance = await getBalance({
  address: "0xUserAddress",
  tokenAddress: cUSD.address,
  decimals: cUSD.decimals,
  publicClient,
});

console.log(balance.formatted, cUSD.symbol); // e.g. "12.345 cUSD"
```

### `sendTip`

Sends a tip via the CeloTip contract. The on-chain `sendTip` call is performed
by a relayer (the senditwithcelo app uses a Supabase Edge Function named
`send-tip`). The SDK handles the ERC20 approval locally, then posts the tip
payload to your relayer URL.

```ts
import { sendTip, CELO_TOKENS } from "senditwithcelo-sdk";

const cUSD = CELO_TOKENS.find((t) => t.symbol === "cUSD")!;

const result = await sendTip({
  from: "0xSender",
  to: "0xRecipient",
  tokenAddress: cUSD.address,
  amount: "1.5",
  decimals: cUSD.decimals,
  message: "thanks!",
  relayerUrl: "https://<your-project>.functions.supabase.co/send-tip",
  walletClient,
  publicClient,
});

console.log(result.hash); // on-chain tx hash from the relayer
```

The relayer is expected to accept this JSON body:

```json
{
  "from": "0x...",
  "to": "0x...",
  "tokenAddress": "0x...",
  "amount": "1500000000000000000",
  "interactionType": "tip",
  "castHash": "thanks!"
}
```

…and respond with `{ "hash": "0x..." }` on success or `{ "error": "..." }` on
failure — matching the senditwithcelo `send-tip` Edge Function.

## Develop

```bash
npm install
npm run build   # compiles src/ -> dist/
```

## Publish

```bash
npm login
npm publish     # runs `npm run build` via prepublishOnly
```

## License

MIT
