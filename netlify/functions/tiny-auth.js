const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { code, grant_type, refresh_token } = body;

    const params = new URLSearchParams();
    params.append('client_id', process.env.VITE_TINY_CLIENT_ID);
    params.append('client_secret', process.env.VITE_TINY_CLIENT_SECRET);

    if (grant_type === 'authorization_code') {
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', process.env.VITE_REDIRECT_URI);
    } else if (grant_type === 'refresh_token') {
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refresh_token);
    }

    const response = await axios.post(
      'https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Auth error:', error.response?.data || error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Authentication failed',
        details: error.response?.data || error.message
      })
    };
  }
};