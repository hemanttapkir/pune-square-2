// app/api/send-lead/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, phone, project_title, notes } = await request.json();

    const data = await resend.emails.send({
      from: 'PuneSquare Leads <onboarding@resend.dev>', // Default Resend test sender
      to: [process.env.MY_LEAD_EMAIL || 'your_actual_gmail@gmail.com'],
      subject: `🚨 New Lead: ${name} (${project_title || 'General Inquiry'})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #10b981;">New Lead Captured!</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
          <p><strong>Project:</strong> ${project_title || 'N/A'}</p>
          <p><strong>Details:</strong> ${notes || 'N/A'}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}