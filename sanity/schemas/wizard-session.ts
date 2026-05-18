import { defineType, defineField } from 'sanity'

export const wizardSession = defineType({
  name: 'wizardSession',
  title: 'Wizard Sessions (סשנים)',
  type: 'document',
  fields: [
    defineField({
      name: 'sessionId',
      title: 'Session ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Unique session identifier (e.g., LW4U-2025-ABC123)',
      readOnly: true,
    }),
    defineField({
      name: 'email',
      title: 'Email (אימייל)',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
      description: 'User email address',
    }),
    defineField({
      name: 'phone',
      title: 'Phone (טלפון)',
      type: 'string',
      description: 'User phone number',
    }),
    defineField({
      name: 'fullName',
      title: 'Full Name (שם מלא)',
      type: 'string',
      description: 'User full name from basicInfo',
    }),
    defineField({
      name: 'wizardData',
      title: 'Wizard Data (נתוני האשף)',
      type: 'object',
      description: 'Complete wizard state (JSON)',
      fields: [
        defineField({
          name: 'currentStep',
          title: 'Current Step',
          type: 'number',
        }),
        defineField({
          name: 'selectedClaims',
          title: 'Selected Claims',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'basicInfo',
          title: 'Basic Info',
          type: 'object',
          fields: [
            { name: 'fullName', type: 'string', title: 'Full Name' },
            { name: 'idNumber', type: 'string', title: 'ID Number' },
            { name: 'email', type: 'string', title: 'Email' },
            { name: 'phone', type: 'string', title: 'Phone' },
            { name: 'address', type: 'string', title: 'Address' },
            { name: 'spouseFullName', type: 'string', title: 'Spouse Full Name' },
            { name: 'spouseIdNumber', type: 'string', title: 'Spouse ID Number' },
          ],
        }),
        defineField({
          name: 'formData',
          title: 'Form Data',
          type: 'text',
          description: 'Claim-specific answers (stored as JSON)',
        }),
        defineField({
          name: 'signature',
          title: 'Signature (base64)',
          type: 'text',
        }),
        defineField({
          name: 'paymentData',
          title: 'Payment Data',
          type: 'object',
          fields: [
            { name: 'paid', type: 'boolean', title: 'Paid' },
            { name: 'date', type: 'datetime', title: 'Payment Date' },
          ],
        }),
      ],
    }),
    defineField({
      name: 'paymentIntentId',
      title: 'Payment Intent ID',
      type: 'string',
      description: 'Legacy payment intent/transaction ID',
    }),
    defineField({
      name: 'paymentProvider',
      title: 'Payment Provider',
      type: 'string',
      description: 'Payment provider used for this session',
    }),
    defineField({
      name: 'growPaymentProcessId',
      title: 'Grow Payment Link Process ID',
      type: 'string',
      description: 'Grow PaymentLinks process ID returned when the payment link is created',
    }),
    defineField({
      name: 'growPaymentProcessToken',
      title: 'Grow Payment Link Process Token',
      type: 'string',
      description: 'Grow PaymentLinks process token returned when the payment link is created',
    }),
    defineField({
      name: 'paymentTransactionId',
      title: 'Payment Transaction ID',
      type: 'string',
      description: 'Transaction ID/asmachta received after successful payment',
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment Status (סטטוס תשלום)',
      type: 'string',
      options: {
        list: [
          { title: 'Pending (ממתין)', value: 'pending' },
          { title: 'Paid (שולם)', value: 'paid' },
          { title: 'Failed (נכשל)', value: 'failed' },
          { title: 'Refunded (הוחזר)', value: 'refunded' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submissionStatus',
      title: 'Submission Status (סטטוס שליחה)',
      type: 'string',
      options: {
        list: [
          { title: 'Pending (ממתין)', value: 'pending' },
          { title: 'Submitted (נשלח)', value: 'submitted' },
          { title: 'Failed (נכשל)', value: 'failed' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'driveSubmissionId',
      title: 'Google Drive Folder ID',
      type: 'string',
      description: 'Google Drive folder ID after successful submission',
    }),
    defineField({
      name: 'totalAmount',
      title: 'Total Amount (₪)',
      type: 'number',
      description: 'Total payment amount in shekels',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At (נוצר ב)',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'paidAt',
      title: 'Paid At (שולם ב)',
      type: 'datetime',
      description: 'Timestamp when payment was completed',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At (נשלח ב)',
      type: 'datetime',
      description: 'Timestamp when submission was completed',
    }),
    defineField({
      name: 'remindersSent',
      title: 'Reminders Sent',
      type: 'number',
      description: 'Number of reminder emails sent',
      initialValue: 0,
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At (פג תוקף ב)',
      type: 'datetime',
      description: 'Session expiration date (30 days from creation)',
    }),
    defineField({
      name: 'notes',
      title: 'Admin Notes (הערות)',
      type: 'text',
      rows: 3,
      description: 'Internal notes for admin use',
    }),
  ],
  preview: {
    select: {
      email: 'email',
      fullName: 'fullName',
      paymentStatus: 'paymentStatus',
      submissionStatus: 'submissionStatus',
      createdAt: 'createdAt',
    },
    prepare({ email, fullName, paymentStatus, submissionStatus, createdAt }: any) {
      const statusEmoji: Record<string, string> = {
        pending: '⏳',
        paid: '✅',
        failed: '❌',
        refunded: '↩️',
      }

      const submissionEmoji: Record<string, string> = {
        pending: '📝',
        submitted: '✅',
        failed: '❌',
      }

      return {
        title: fullName || email || 'No name',
        subtitle: `${statusEmoji[paymentStatus] || '❓'} ${paymentStatus} • ${submissionEmoji[submissionStatus] || '❓'} ${submissionStatus} • ${new Date(createdAt).toLocaleDateString('he-IL')}`,
      }
    },
  },
  orderings: [
    {
      title: 'Created Date, New',
      name: 'createdDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Created Date, Old',
      name: 'createdAsc',
      by: [{ field: 'createdAt', direction: 'asc' }],
    },
    {
      title: 'Payment Status',
      name: 'paymentStatus',
      by: [
        { field: 'paymentStatus', direction: 'asc' },
        { field: 'createdAt', direction: 'desc' },
      ],
    },
  ],
})
