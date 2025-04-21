type predictResponse = {
  input_image: string,
  object_count: number,
  result_image: string
};

export async function uploadPredict(file: File, param_1: number, param_2: number): Promise<predictResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error('Missing BACKEND_URL environment variable');
  }

  var formData = new FormData();
  formData.append('file', file);
  formData.append('param_1', Math.round(param_1 * 100).toString());
  formData.append('param_2', Math.round(param_2 * 100).toString());

  const res = await fetch(`${backendUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  return data;
}
  