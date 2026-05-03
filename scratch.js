const ZEROG_COMPUTE_ENDPOINT = 'https://compute-network-6.integratenetwork.work/v1/proxy';
const ZEROG_COMPUTE_KEY = 'app-sk-eyJhZGRyZXNzIjoiMHhkNWI5RWQ5RTNjN2I3MmU5N2ZEYmU4RGU4MThCMDcyOTAxZUVCMDk4IiwicHJvdmlkZXIiOiIweGE0OGYwMTI4NzIzMzUwOUZENjk0YTIyQmY4NDAyMjUwNjJFNjc4MzYiLCJ0aW1lc3RhbXAiOjE3Nzc3OTQyNDU5OTIsImV4cGlyZXNBdCI6MCwibm9uY2UiOiIxNzc3Nzk0MjQ1OTkyLWZpdjc4eXdhMWlrMDAwMDAwMCIsImdlbmVyYXRpb24iOjAsInRva2VuSWQiOjB9fDB4Yzk2YzZiYjYxNTMzOTVhZDI0Mjk4NTY2ZjU2YjcyZDNlMDQ0NmYxMDQ3NDI0ZTM5NmM4YzFmMWE3ZjYyMmYxNzRkMzk1MDEyZTM0YmNiYTU4MWIyZTAzZGE0YzBhZDU0OTgzODVjOGY1ZGJmM2Y0ODdiOGI2ZjEzMGQ5OGNlMGQxYg==';

async function test() {
  const res = await fetch(`${ZEROG_COMPUTE_ENDPOINT}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ZEROG_COMPUTE_KEY}` },
    body: JSON.stringify({ model: 'qwen3.6-plus', messages: [{role: 'user', content: 'hello'}] })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
