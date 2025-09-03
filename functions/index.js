const { setGlobalOptions } = require("firebase-functions");
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors");


setGlobalOptions({ maxInstances: 10 });

const allowedOrigins = ["http://localhost:4200", "https://hefmgc.com"];
const corsHandler = cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error("No permitido por CORS"));
    }
});

// Transporter Nodemailer usando App Password
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD   // App Password de Hostinger
    }
});

exports.sendOrderEmail = functions.https.onRequest(
    { secrets: ["APP_PASSWORD", "APP_EMAIL"] },
    (req, res) => {
        corsHandler(req, res, async () => {
            if (req.method !== "POST") {
                res.status(405).json({ success: false, error: "Método no permitido" });
                return;
            }

            const { total, name, email, orderDetails } = req.body;

            if (!name || !email) {
                res.status(400).json({ success: false, error: "Nombre y correo son obligatorios" });
                return;
            }

            if (total < 50) {
                res.status(400).json({ success: false, error: "El importe mínimo es 50€" });
                return;
            }

            // Mensaje pedido
            const mailOrder = {
                from: `"HEFM" <${process.env.APP_EMAIL}>`,
                to: email,
                replyTo: process.env.APP_EMAIL,
                subject: "Confirmación de pedido",
                text: `Hola ${name}, tu pedido de ${total.toFixed(2)}€ ha sido recibido.`,
                html: `
                    <h2>Hola ${name},</h2>
                    <p>Tu pedido de <b>${total.toFixed(2)}€</b> ha sido recibido.</p>
                    <h3>Detalles del pedido:</h3>
                    <ul>
                    ${orderDetails.map(item => {
                    const igicRate = item.prod.igic === 'bebida' ? 0.07 : 0.03; // 7% bebidas, 3% alimentos
                    const priceWithIGIC = item.format.precioFinal * (1 + igicRate);
                    const subtotalWithIGIC = priceWithIGIC * item.cantidad;

                    return `
                                <li>
                                ${item.prod.prodName} <br>- ${item.cantidad} unidades x ${item.format.precioFinal.toFixed(2)}€<br>
                                - IGIC: ${(igicRate * 100).toFixed(0)}% <br>
                                - subtotal: <b>${subtotalWithIGIC.toFixed(2)}€</b>
                                </li>
                            `;
                }).join('')}
                    </ul>
                    <p><strong>Total: ${total.toFixed(2)}€</strong></p>
                    <p>Gracias por comprar con HEFM!</p>
                `
            };

            // Copia
            const mailCopy = {
                from: `"HEFM" <${process.env.APP_EMAIL}>`,
                to: process.env.APP_EMAIL,
                replyTo: email,
                subject: "Nuevo pedido recibido",
                text: `Pedido de ${name} (${email}): ${total}€`,
                html: `
                    <p>Pedido de ${name} (${email}): <b>${total}€</b></p>
                    <h3>Detalles del pedido:</h3>
                    <ul>
                    ${orderDetails.map(item => {
                    const igicRate = item.prod.igic === 'bebida' ? 0.07 : 0.03; // 7% bebidas, 3% alimentos
                    const priceWithIGIC = item.format.precioFinal * (1 + igicRate);
                    const subtotalWithIGIC = priceWithIGIC * item.cantidad;

                    return `
                                <li>
                                ${item.prod.prodName} <br>- ${item.cantidad} unidades x ${item.format.precioFinal.toFixed(2)}€<br>
                                - IGIC: ${(igicRate * 100).toFixed(0)}% <br>
                                - subtotal: <b>${subtotalWithIGIC.toFixed(2)}€</b>
                                </li>
                            `;
                }).join('')}
                    </ul>
                    <p><strong>Total: ${total.toFixed(2)}€</strong></p>
                `
            };

            try {
                await transporter.sendMail(mailOrder);
                await transporter.sendMail(mailCopy);
                res.status(200).json({ success: true });
            } catch (err) {
                console.error("Error al enviar correo:", err);
                res.status(500).json({ success: false, error: err.message });
            }
        });
    }
);

