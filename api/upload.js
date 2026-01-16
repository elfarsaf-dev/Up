export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      "https://api.ferdev.my.id/remote/elfar",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: req
      }
    );

    const data = await response.text();

    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
}
