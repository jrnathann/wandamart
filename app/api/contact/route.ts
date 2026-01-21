import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Load environment variables
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO; // where contact messages go

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, phone, subject, message } = data;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: EMAIL_TO,
      subject: `[Contact] ${subject}`,
      text: `Nom: ${name}\nEmail: ${email}\nTéléphone: ${phone}\n\nMessage:\n${message}`,
      html: `
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Téléphone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Message envoyé avec succès !" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Impossible d'envoyer le message" }, { status: 500 });
  }
}
