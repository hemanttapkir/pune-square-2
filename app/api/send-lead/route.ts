import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g., hemanttapkir7@gmail.com
    pass: process.env.EMAIL_PASS, // Gmail 16-character "App Password"
  },
});

export async function POST(request: Request) {
  try {
    const { name, phone, project_title, notes } = await request.json();

    await transporter.sendMail({
      from: `"PuneSquare Leads" <${process.env.EMAIL_USER}>`,
      to: process.env.MY_LEAD_EMAIL || 'hemanttapkir7@gmail.com',
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}