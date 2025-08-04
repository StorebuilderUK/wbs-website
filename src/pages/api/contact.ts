import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Here you would typically:
    // 1. Send email via SendGrid/SMTP
    // 2. Save to database
    // 3. Trigger notifications
    
    // For now, we'll create a simple integration with your Django backend
    // You can either:
    
    // Option 1: Send directly to your Django API
    /*
    const djangoResponse = await fetch('https://conductor.webuildstores.co.uk/api/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        service: data.service || '',
        message: data.message,
        source: 'website_contact_form'
      })
    });
    
    if (!djangoResponse.ok) {
      throw new Error('Failed to submit to backend');
    }
    */
    
    // Option 2: Use webhook to trigger email
    /*
    await fetch('YOUR_WEBHOOK_URL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    */
    
    // Option 3: Log to console for now (development)
    console.log('Contact form submission:', {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // Return success response
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Message received successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};