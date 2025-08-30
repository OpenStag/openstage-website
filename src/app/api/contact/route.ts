import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

        // This API route is intentionally left blank. The contact form simulates submission on the client only.
        const { data, error } = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: ['delivered@resend.dev'],
          subject: subject,
          html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
        });
    
        if (error) {
          return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
          );
        }
    
        return NextResponse.json(
          { message: 'Email sent successfully', data },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }
