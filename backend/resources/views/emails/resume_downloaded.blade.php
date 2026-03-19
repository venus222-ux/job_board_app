<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Resume Was Downloaded</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            padding: 30px 24px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content {
            padding: 32px 24px;
            background: white;
        }
        .emoji {
            font-size: 48px;
            margin-bottom: 16px;
            text-align: center;
        }
        .greeting {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 16px;
        }
        .message {
            color: #6b7280;
            margin-bottom: 24px;
            font-size: 16px;
        }
        .details-card {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            border-left: 4px solid #4f46e5;
        }
        .detail-item {
            display: flex;
            margin-bottom: 12px;
        }
        .detail-label {
            font-weight: 600;
            color: #4b5563;
            width: 100px;
            flex-shrink: 0;
        }
        .detail-value {
            color: #1f2937;
            font-weight: 500;
        }
        .company-badge {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 8px;
        }
        .footer {
            padding: 24px;
            text-align: center;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: #4f46e5;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 16px;
        }
        .button:hover {
            background: #4338ca;
        }
        hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 24px 0;
        }
        .timestamp {
            font-size: 13px;
            color: #9ca3af;
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📄 Resume Downloaded</h1>
        </div>

        <div class="content">
            <div class="emoji">
                👋
            </div>

            <div class="greeting">
                Hello {{ $candidateName }}!
            </div>

            <div class="message">
                Great news! An employer has shown interest in your application and downloaded your resume.
            </div>

            <div class="details-card">
                <h3 style="margin-top: 0; margin-bottom: 16px; color: #1f2937; font-size: 18px;">
                    🏢 Employer Details
                </h3>

                <div class="detail-item">
                    <span class="detail-label">Company:</span>
                    <span class="detail-value">{{ $companyName }}</span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Position:</span>
                    <span class="detail-value">{{ $jobTitle }}</span>
                </div>

                @if($jobLocation)
                <div class="detail-item">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{ $jobLocation }}</span>
                </div>
                @endif

                <div class="detail-item">
                    <span class="detail-label">Downloaded:</span>
                    <span class="detail-value">{{ $downloadedAt }}</span>
                </div>

                <span class="company-badge">
                    ⚡ Your resume caught their attention!
                </span>
            </div>

            <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #1e40af; font-weight: 500;">
                    💡 <strong>What's next?</strong> The employer may contact you for an interview.
                    Keep an eye on your email and phone in the coming days.
                </p>
            </div>

            <hr>

            <p style="color: #6b7280; margin-bottom: 0;">
                Thank you for using our platform. We wish you the best of luck with your job application!
            </p>

            <div class="timestamp">
                This email was sent automatically when an employer downloaded your resume.
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0 0 8px;">
                © {{ date('Y') }} MyApp. All rights reserved.
            </p>
            <p style="margin: 0; font-size: 12px;">
                You're receiving this because you applied for a position through our platform.
            </p>
        </div>
    </div>
</body>
</html>
