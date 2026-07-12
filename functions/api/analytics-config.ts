/// <reference types="@cloudflare/workers-types" />

interface Env {
  UMAMI_SCRIPT_URL?: string;
  UMAMI_WEBSITE_ID?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env } = context;
    const scriptUrl = env.UMAMI_SCRIPT_URL || '';
    const websiteId = env.UMAMI_WEBSITE_ID || '';

    return new Response(
      JSON.stringify({ scriptUrl, websiteId }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  } catch (error: any) {
    console.error('Analytics config endpoint failed:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch analytics configuration.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
