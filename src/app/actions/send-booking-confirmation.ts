'use server';

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { BookingConfirmation } from '@/emails/BookingConfirmation';
import { env } from '@/env.server';

const resend = new Resend(env.RESEND_API_KEY);

export interface BookingConfirmationData {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  address: string;
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  totalPrice: number;
  cleanerName?: string;
  specialInstructions?: string;
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  try {
    // Validate required fields
    if (!data.customerEmail || !data.customerName || !data.bookingId) {
      throw new Error('Missing required fields for booking confirmation email');
    }

    // Render the email template to HTML
    const emailHtml = render(BookingConfirmation({
      customerName: data.customerName,
      bookingId: data.bookingId,
      serviceName: data.serviceName,
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      address: data.address,
      postcode: data.postcode,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      totalPrice: data.totalPrice,
      cleanerName: data.cleanerName,
      specialInstructions: data.specialInstructions,
    }));

    // Send the email using Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'Shalean Services <noreply@shaleanservices.com>',
      to: [data.customerEmail],
      subject: `Booking Confirmation - ${data.bookingId}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send booking confirmation email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Booking confirmation email sent successfully:', emailData);
    return { success: true, messageId: emailData?.id };
  } catch (error) {
    console.error('Error in sendBookingConfirmation:', error);
    throw error;
  }
}
