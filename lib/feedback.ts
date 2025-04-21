export async function sendFeedback(like: boolean, filename: string, param_1: number, param_2: number) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error('Missing BACKEND_URL environment variable');
  }

  const requestBody = {
    like: like,
    fileName: filename,
    param_1: Math.round(param_1 * 100),
    param_2: Math.round(param_2 * 100),
  };

  const res = await fetch(`${backendUrl}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
}
