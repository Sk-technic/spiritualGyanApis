const express = require('express');
const router = express.Router();
const { sendMail } = require('../service/mailer.service.js');
const { mailLimiter } = require('../middlewares/rateLimiter');
require("dotenv").config(); // must come first

/**
 * POST /mail/send
 * body: { to: string, subject: string, text?: string, html?: string }
 */

router.post("/send", async (req, res, next) => {
  try {
    const { from, subject, name , lastname,phone,message} = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Message is required !",
      });
    }

    // ---- Extract details from req.body (here we assume body contains structured info) ----
    // You could also parse them out of text/html if needed.
    const userName = name+" "+lastname; // demo hardcoded since body had it inside html
    const userPhone = phone || "not provided";
    const userEmail = from || "not provided";
    const userMessage = message
      "Travel Expert Assistance\nEmail: support@motodiscovery.com\nPhone: +91 89501 01088";

    // ---- Professional Template with injected data ----
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Contact Submission</title>
</head>

<body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background:#f3fdf6;">

    <!-- Wrapper -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:40px 0; background:#f3fdf6;">
        <tr>
            <td align="center">

                <!-- Card -->
                <table width="650" border="0" cellspacing="0" cellpadding="0"
                    style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">

                    <!-- Header with Logo -->
                    <tr>
                        <td style="padding: 16px 24px; border-bottom:1px solid #ccc;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                <tr>
                                    <!-- Logo -->
                                    <td style="width: 100px; vertical-align: middle; padding-right: 20px;">
                                        <img src="https://spiritualgyanapis.onrender.com/public/favicon.png" alt="Spiritual Gyan Logo"
                                            style="max-width: 80px; display: block; border: 0;" />
                                    </td>

                                    <!-- Text Content -->
                                    <td style="vertical-align: middle; text-align: right;">
                                        <h1
                                            style="margin:0; font-size:18px; color:#535353; font-weight:700; font-family:Arial, sans-serif;">
                                            New Client Query
                                        </h1>
                                        <p
                                            style="margin:6px 0 0; font-size:14px; color:#555; font-weight:300; font-family:Arial, sans-serif;">
                                            A client has reached out through Spiritual Gyan
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>

                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:35px 30px;">

                            <p style="font-size:16px; margin:0 0 18px; color:#222;">Hi, <strong>Admin</strong>,</p>
                            <p style="font-size:15px; margin:0 0 22px; line-height:1.6; color:#444;">
                                A client has submitted a new query through our website.
                                Please find their details below for your review:
                            </p>

                            <!-- Contact Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="border:1px solid #e0f2e9; border-radius:12px; overflow:hidden; margin-bottom:30px;">
                                <tr style="background:#f9fdfb;">
                                    <td
                                        style="padding:16px 20px; font-size:15px; font-weight:600; color:#22c543; width:160px;">
                                        Name</td>
                                    <td style="padding:16px 20px; font-size:15px; color:#333;">${userName}</td>
                                </tr>
                                <tr style="background:#ffffff;">
                                    <td style="padding:16px 20px; font-size:15px; font-weight:600; color:#22c55e;">Phone
                                    </td>
                                    <td style="padding:16px 20px; font-size:15px; color:#333;">${userPhone}</td>
                                </tr>
                                <tr style="background:#f9fdfb;">
                                    <td style="padding:16px 20px; font-size:15px; font-weight:600; color:#22c55e;">Email
                                    </td>
                                    <td style="padding:16px 20px; font-size:15px; color:#333;">${userEmail}</td>
                                </tr>
                                <tr style="background:#ffffff;">
                                    <td
                                        style="padding:16px 20px; font-size:15px; font-weight:600; color:#22c55e; vertical-align:top;">
                                        Message</td>
                                    <td style="padding:16px 20px; font-size:15px; color:#333;">${userMessage}</td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <div style="text-align:center; margin-bottom:25px;">
                                <a href="mailto:${userEmail}"
                                    style="display:inline-block; background:#22c55e; color:#fff; text-decoration:none; padding:14px 34px; border-radius:32px; font-size:15px; font-weight:600; box-shadow:0 6px 12px rgba(34,197,94,0.35);">
                                    Reply to User
                                </a>
                            </div>

                            <p style="font-size:15px; margin:0 0 5px; color:#444;">Thank you for your attention to this
                                matter.</p>
                            <p style="font-size:15px; margin:0 0 5px; color:#444;">Best regards,</p>
                            <p style="font-size:15px; font-weight:600; margin:0; color:#111;">The Spiritual Gyan Team
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background:#f0fdf4; padding:20px; font-size:13px; color:#666;">
                            © 2025 <strong>Spiritual Gyan</strong>. All rights reserved.
                            <br />
                            <span style="font-size:12px; color:#94a3b8;">Connecting souls through wisdom &
                                spirituality.</span>
                        </td>
                    </tr>

                </table>
                <!-- End Card -->

            </td>
        </tr>
    </table>
    <!-- End Wrapper -->

</body>

</html>
`;

    // ---- Send Mail ----
    const info = await sendMail({
      from,
      subject,
      html: emailHtml,
    });

    console.log("response------:", info);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      info,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/health',(req,res)=>{
res.status(200).json({
    message:"ok api is running",
    success:true
})
})


module.exports = router;
