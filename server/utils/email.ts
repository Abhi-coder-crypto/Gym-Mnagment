import dotenv from 'dotenv';
dotenv.config();

import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { SystemSettings } from '../models';
import { Notification } from '../models/notification';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailLog {
  userId?: string;
  email: string;
  subject: string;
  status: 'success' | 'failed';
  provider: string;
  error?: string;
}

class EmailService {
  private sendGridConfigured: boolean = false;
  private smtpConfigured: boolean = false;
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string = '';
  private provider: string = 'sendgrid';

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.sendGridConfigured = true;
      this.provider = 'sendgrid';
      console.log('📧 SendGrid email service configured');
    }

    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.smtpConfigured = true;
      if (!this.sendGridConfigured) {
        this.provider = 'smtp';
        console.log('📧 SMTP email service configured');
      }
    }

    this.fromEmail = process.env.EMAIL_FROM || 'noreply@fitpro.com';
  }

  private async getSystemEmailConfig() {
    try {
      const settings = await SystemSettings.findOne();
      if (settings?.integrations?.email) {
        return {
          enabled: settings.integrations.email.enabled,
          fromEmail: settings.integrations.email.fromEmail || this.fromEmail,
          provider: settings.integrations.email.provider || this.provider,
        };
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
    return {
      enabled: true,
      fromEmail: this.fromEmail,
      provider: this.provider,
    };
  }

  private async logEmailAttempt(log: EmailLog) {
    try {
      if (log.userId) {
        await Notification.create({
          userId: log.userId,
          type: 'reminder',
          title: `Email ${log.status === 'success' ? 'Sent' : 'Failed'}`,
          message: log.status === 'success'
            ? `Email sent to ${log.email}: ${log.subject}`
            : `Failed to send email to ${log.email}: ${log.error || 'Unknown error'}`,
          isRead: false,
          createdAt: new Date(),
        });
      }

      console.log(
        `📧 Email ${log.status === 'success' ? '✅ SUCCESS' : '❌ FAILED'} [${log.provider}] to: ${log.email} | subject: ${log.subject}${
          log.error ? ` | error: ${log.error}` : ''
        }`
      );
    } catch (error) {
      console.error('Failed to log email attempt to database:', error);
      console.log(
        `📧 Email ${log.status === 'success' ? '✅ SUCCESS' : '❌ FAILED'} [${log.provider}] to: ${log.email} | subject: ${log.subject}${
          log.error ? ` | error: ${log.error}` : ''
        }`
      );
    }
  }

  private replaceTemplateVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    }
    return result;
  }

  async sendEmail(
    options: EmailOptions,
    userId?: string,
    templateVariables?: Record<string, any>
  ): Promise<boolean> {
    const config = await this.getSystemEmailConfig();

    if (!config.enabled) {
      console.log('📧 Email sending is disabled in system settings');
      return false;
    }

    if (!this.sendGridConfigured && !this.smtpConfigured) {
      const error = 'No email service configured. Please set SENDGRID_API_KEY or SMTP credentials.';
      await this.logEmailAttempt({
        userId,
        email: options.to,
        subject: options.subject,
        status: 'failed',
        provider: 'none',
        error,
      });
      console.error(`📧 ${error}`);
      return false;
    }

    const subject = templateVariables
      ? this.replaceTemplateVariables(options.subject, templateVariables)
      : options.subject;

    const html = templateVariables
      ? this.replaceTemplateVariables(options.html, templateVariables)
      : options.html;

    const text = options.text
      ? templateVariables
        ? this.replaceTemplateVariables(options.text, templateVariables)
        : options.text
      : undefined;

    try {
      if (this.sendGridConfigured && (config.provider === 'sendgrid' || !this.smtpConfigured)) {
        await sgMail.send({
          to: options.to,
          from: config.fromEmail,
          subject,
          html,
          text,
        });

        await this.logEmailAttempt({
          userId,
          email: options.to,
          subject,
          status: 'success',
          provider: 'sendgrid',
        });

        return true;
      } else if (this.smtpConfigured && this.transporter) {
        await this.transporter.sendMail({
          from: config.fromEmail,
          to: options.to,
          subject,
          html,
          text,
        });

        await this.logEmailAttempt({
          userId,
          email: options.to,
          subject,
          status: 'success',
          provider: 'smtp',
        });

        return true;
      }

      throw new Error('No email provider available');
    } catch (error: any) {
      await this.logEmailAttempt({
        userId,
        email: options.to,
        subject,
        status: 'failed',
        provider: this.sendGridConfigured ? 'sendgrid' : 'smtp',
        error: error.message,
      });

      console.error('📧 Email sending error:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<boolean> {
    try {
      const settings = await SystemSettings.findOne();
      const gymName = settings?.branding?.gymName || 'FitPro';
      
      const resetUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>You requested to reset your password for your ${gymName} account.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ${gymName}. All rights reserved.
          </p>
        </div>
      `;

      const text = `Password Reset Request\n\nHi ${userName},\n\nYou requested to reset your password for your ${gymName} account.\n\nClick this link to reset your password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this password reset, please ignore this email.\n\n© ${new Date().getFullYear()} ${gymName}`;

      return await this.sendEmail({
        to: email,
        subject: `Password Reset - ${gymName}`,
        html,
        text,
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendSessionReminderEmail(
    email: string,
    clientName: string,
    sessionName: string,
    sessionDate: Date,
    userId?: string
  ): Promise<boolean> {
    try {
      const settings = await SystemSettings.findOne();
      const gymName = settings?.branding?.gymName || 'FitPro';
      
      const template = settings?.emailTemplates?.sessionReminder;
      if (!template?.enabled) {
        console.log('📧 Session reminder emails are disabled in system settings');
        return false;
      }

      const formattedDate = new Date(sessionDate).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const templateVars = {
        clientName,
        sessionName,
        sessionDate: formattedDate,
        gymName,
      };

      const subject = this.replaceTemplateVariables(template.subject, templateVars);
      const bodyHtml = this.replaceTemplateVariables(template.body, templateVars);

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Session Reminder</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${bodyHtml}
          </div>
          <p style="margin-top: 20px;">Looking forward to seeing you!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ${gymName}. All rights reserved.
          </p>
        </div>
      `;

      return await this.sendEmail(
        {
          to: email,
          subject,
          html,
        },
        userId,
        templateVars
      );
    } catch (error) {
      console.error('Error sending session reminder email:', error);
      return false;
    }
  }

  async sendInvoiceEmail(
    email: string,
    clientName: string,
    invoiceNumber: string,
    amount: number,
    dueDate: Date,
    userId?: string
  ): Promise<boolean> {
    try {
      const settings = await SystemSettings.findOne();
      const gymName = settings?.branding?.gymName || 'FitPro';

      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);

      const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Invoice from ${gymName}</h2>
          <p>Hi ${clientName},</p>
          <p>Your invoice is ready. Please find the details below:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Invoice Number:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right;">${invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right; color: #3b82f6; font-size: 18px; font-weight: bold;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Due Date:</strong></td>
                <td style="padding: 10px 0; text-align: right;">${formattedDueDate}</td>
              </tr>
            </table>
          </div>
          <p>Please make the payment by the due date to avoid any service interruption.</p>
          <p>If you have any questions, please contact us.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ${gymName}. All rights reserved.
          </p>
        </div>
      `;

      const text = `Invoice from ${gymName}\n\nHi ${clientName},\n\nYour invoice is ready:\n\nInvoice Number: ${invoiceNumber}\nAmount: ${formattedAmount}\nDue Date: ${formattedDueDate}\n\nPlease make the payment by the due date.\n\n© ${new Date().getFullYear()} ${gymName}`;

      return await this.sendEmail(
        {
          to: email,
          subject: `Invoice ${invoiceNumber} - ${gymName}`,
          html,
          text,
        },
        userId
      );
    } catch (error) {
      console.error('Error sending invoice email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, clientName: string, userId?: string): Promise<boolean> {
    try {
      const settings = await SystemSettings.findOne();
      const gymName = settings?.branding?.gymName || 'FitPro';
      
      const template = settings?.emailTemplates?.welcome;
      if (!template?.enabled) {
        console.log('📧 Welcome emails are disabled in system settings');
        return false;
      }

      const templateVars = {
        clientName,
        gymName,
      };

      const subject = this.replaceTemplateVariables(template.subject, templateVars);
      const bodyHtml = this.replaceTemplateVariables(template.body, templateVars);

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Welcome to ${gymName}!</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${bodyHtml}
          </div>
          <p>We're excited to have you as part of our fitness community!</p>
          <p>If you have any questions, feel free to reach out to us.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ${gymName}. All rights reserved.
          </p>
        </div>
      `;

      return await this.sendEmail(
        {
          to: email,
          subject,
          html,
        },
        userId,
        templateVars
      );
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
