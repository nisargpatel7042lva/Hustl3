export interface UniswapQuoteParams {
  tokenInChainId: number;
  tokenIn: string;
  tokenOutChainId: number;
  tokenOut: string;
  amount: string;
  type: 'EXACT_INPUT' | 'EXACT_OUTPUT';
  swapper: string;
}

/**
 * Uses the official Uniswap Developer API (api.uniswap.org)
 * Documentation: https://developers.uniswap.org/docs/api/
 */
export async function getUniswapQuote(params: UniswapQuoteParams) {
  const queryParams = new URLSearchParams({
    tokenInChainId: params.tokenInChainId.toString(),
    tokenIn: params.tokenIn,
    tokenOutChainId: params.tokenOutChainId.toString(),
    tokenOut: params.tokenOut,
    amount: params.amount,
    type: params.type,
  });

  const response = await fetch(`https://api.uniswap.org/v2/quote?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.UNISWAP_API_KEY || ''
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Uniswap Quote Error:', errorText);
    throw new Error(`Failed to fetch Uniswap quote: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Once the user approves the quote, this endpoint fetches the calldata.
 */
export async function buildUniswapTransaction(quoteData: any, swapper: string) {
  // In a real integration, you would hit https://api.uniswap.org/v2/swap
  // passing the quote data and the wallet address to get the transaction object.
  
  const swapPayload = {
    quote: quoteData,
    swapper
  };

  const response = await fetch('https://api.uniswap.org/v2/swap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.UNISWAP_API_KEY || ''
    },
    body: JSON.stringify(swapPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to build Uniswap transaction: ${errorText}`);
  }

  const data = await response.json();
  // data.methodParameters contains { calldata, value, to }
  return data.methodParameters;
}
