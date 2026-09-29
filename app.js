const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/lokasi", async (req, res) => {
    const kota = req.query.kota;

    if (!kota) {
        return res.status(400).json({ message: "Input lokasi diperlukan" });
    }

    const apiKey = "ZPMTmBZwlP4zogSQpxTn"; 
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(kota)}.json?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        // Memastikan data ditemukan
        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const [longitude, latitude] = feature.geometry.coordinates;

            let negara = '-', provinsi = '-', kecamatan = '-';

            if (feature.context) {
                feature.context.forEach(item => {
                    if (item.id.startsWith('country')) negara = item.text;
                    if (item.id.startsWith('region') || item.id.startsWith('province')) provinsi = item.text;
                    if (item.id.startsWith('county') || item.id.startsWith('subdistrict')) kecamatan = item.text;
                });
            }

            res.json({
                negara: negara,
                provinsi: provinsi,
                kecamatan: kecamatan,
                longitude: longitude,
                latitude: latitude
            });
        } else {
            res.status(404).json({ message: "Lokasi tidak ditemukan di MapTiler" });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Gagal mengambil data dari MapTiler"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});