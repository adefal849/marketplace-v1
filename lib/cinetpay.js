// Intégration CinetPay — pas de frais mensuels ni d'installation côté
// CinetPay, uniquement une commission prélevée sur chaque transaction
// réussie (variable selon pays/opérateur). Doc : https://docs.cinetpay.com
const URL_INIT = "https://api-checkout.cinetpay.com/v2/payment";
const URL_VERIFICATION = "https://api-checkout.cinetpay.com/v2/payment/check";

// Démarre un paiement et retourne la réponse CinetPay brute.
// En cas de succès : reponse.data.payment_url est le lien à ouvrir/rediriger.
export async function initierPaiementCinetPay({
  transactionId,
  montant,
  description,
  notifyUrl,
  returnUrl,
  client,
}) {
  const res = await fetch(URL_INIT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.CINETPAY_APIKEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: montant,
      currency: "XOF",
      description,
      notify_url: notifyUrl,
      return_url: returnUrl,
      channels: "ALL", // mobile money + carte bancaire
      customer_name: client?.nom || "Client",
      customer_surname: client?.surnom || "Find Your Shop",
      customer_email: client?.email || "contact@findyourshop.store",
      customer_phone_number: client?.telephone || "+229000000",
      customer_address: "N/A",
      customer_city: "N/A",
      customer_country: client?.pays || "BJ",
      customer_state: client?.pays || "BJ",
      customer_zip_code: "00000",
      lang: "FR",
    }),
  });
  return res.json();
}

// Interroge CinetPay pour connaître le vrai statut d'une transaction.
// À TOUJOURS appeler avant d'activer un abonnement — ne jamais faire
// confiance au seul appel du notify_url (voir doc "Lien de notification").
export async function verifierPaiementCinetPay(transactionId) {
  const res = await fetch(URL_VERIFICATION, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.CINETPAY_APIKEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
    }),
  });
  return res.json();
}
