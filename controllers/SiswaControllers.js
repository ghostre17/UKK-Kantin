const Siswa = require("../models/Siswa");
const User = require("../models/User");
const Menu = require('../models/Menu')
const Transaksi = require("../models/Transaksi");
const Detail_transaksi = require("../models/Detail_transaksi");
const pdf = require('html-pdf')
const path = require('path')
const bcrypt = require("bcrypt");
const { Op } = require("sequelize")

const updateSiswa = async (req, res) => {
  const { username, email, password, nama_siswa, alamat, no_telp } = req.body;
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    const siswa = await Siswa.findOne({ where: { id_user: req.user.id } });
    if (user && siswa) {
      let hashas = user.password;
      if (password) {
        hashas = await bcrypt.hashSync(password, 10);
      }
      await user.update({ username, email, password: hashas });
      await siswa.update({ nama_siswa, alamat, no_telp });
      res
        .status(200)
        .json({ message: "Updating profile success", data: { user, siswa } });
    } else {
      res.status(404).json({ message: "Updating profile fail" });
    }
  } catch (err) {
    res.status(500).json({ message: "Cant update Siswa", error: err });
  }
};

const profileSiswa = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    const siswa = await Siswa.findOne({ where: { id_user: req.user.id } });
    if (siswa && user) {
      res.status(200).json({ message: "Your profile", data: { user, siswa } });
    } else {
      res.status(404).json({ message: "Cant load your profile" });
    }
  } catch (err) {
    res.status(500).json({ message: "Cant find Siswa", error: err });
  }
};

const deleteSiswa = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    const siswa = await Siswa.findOne({ where: { id_user: req.user.id } });
    if (user && siswa) {
      await user.destroy();
      await siswa.destroy();
      res.status(200).json({ message: "Deleting profile success" });
    }
  } catch (err) {
    res.status(500).json({ message: "Cant delete Siswa", error: err });
  }
};

const historySiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findOne({ where: { id_user: req.user.id } });
    if (siswa) {
      const transaksi = await Transaksi.findAll({
        where: { 
            id_siswa: siswa.id,
            status : "sampai"
        },
      });

      if (transaksi.length > 0) {
        const detail_transaksi = await Promise.all(
          transaksi.map(async (trx) => {
            return await Detail_transaksi.findAll({
              where: { id_transaksi: trx.id },
            });
          })
        );
        const result = transaksi.map((trx, index) => ({
          transaksi: trx,
          detail_transaksi: detail_transaksi[index],
        }));

        res
          .status(200)
          .json({
            message: "Getting history transaction completed!",
            data: result,
          });
      } else {
        res
          .status(404)
          .json({ message: "No transactions found for this siswa" });
      }
    } else {
      res.status(404).json({ message: "Siswa not found!" });
    }
  } catch (err) {
    res.status(500).json({
      message: "Cant get history Siswa",
    });
  }
};

const generateNotaHTML = (siswa, transaksi, detail_transaksi) => {

  const itemsHTML = detail_transaksi.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.id_menu}</td>
      <td>${transaksi.id_stan}</td>
      <td>${item.quantity}</td>
      <td>Rp ${item.harga_beli.toLocaleString('id-ID')}</td>
    </tr>
  `).join('');

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <h2>Nota Pemesanan</h2>
        <p><strong>Nama:</strong> ${siswa.nama_siswa}</p>
        <p><strong>Alamat:</strong> ${siswa.alamat}</p>
        <p><strong>No. Telp:</strong> ${siswa.no_telp}</p>
        <p><strong>Tanggal:</strong> ${new Date(transaksi.tanggal).toLocaleDateString('id-ID')}</p>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>ID Menu</th>
              <th>ID Stan</th>
              <th>Qty</th>
              <th>Harga</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </body>
    </html>
  `;
};

const notaSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const siswa = await Siswa.findOne({ where: { id_user: req.user.id } });

    if (!siswa) return res.status(404).json({ message: "Siswa not found!" });

    const transaksi = await Transaksi.findOne({
      where: { id_siswa: siswa.id, id },
    });

    if (!transaksi) return res.status(404).json({ message: "Transaksi not found!" });

    const detail_transaksi = await Detail_transaksi.findAll({
      where: { id_transaksi: transaksi.id },
    });

    const html = generateNotaHTML(siswa, transaksi, detail_transaksi);

    const filename = `nota-transaksi-${siswa.id}-${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../PDF', filename);

    pdf.create(html).toFile(filepath, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Gagal bikin PDF", error: err });
      }

      return res.status(200).json({
        message: 'PDF berhasil dibuat dan disimpan!',
        filepath,
        downloadURL: `/download/nota/${filename}`,
        data: {
          siswa,
          transaksi,
          detail_transaksi
        }
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cant generate nota Siswa", error: err });
  }
};

const queueSiswa = async (req, res) => {
  try {
    // console.log("USER ID FROM TOKEN =>", req.user.id);
    const siswa = await Siswa.findOne({ where: { id_user: req.user.id } });
    // console.log("SISWA =>", siswa);
    if (siswa) {
      const transaksi = await Transaksi.findAll({
        where: {
          id_siswa: siswa.id,
          status : { [Op.ne] : "sampai"}
        },
      });

      if (transaksi.length > 0) {
        const detail_transaksi = await Promise.all(
          transaksi.map(async (trx) => {
            return await Detail_transaksi.findAll({
              where: { id_transaksi: trx.id },
            });
          })
        );
        const result = transaksi.map((trx, index) => ({
          transaksi: trx,
          detail_transaksi: detail_transaksi[index],
        }));
      
        res.status(200).json({
          message: "Queue transaction completed!",
          data: result,
        });
      } else {
        res.status(404).json({ message: "No queue transactions found in your cart!" });
      }
      
    } else {
      res.status(404).json({ message: "Siswa not found!" });
    }
  } catch (err) {
    // console.error("ERROR di queueSiswa =>", err);
    res.status(500).json({ message: "Queue siswa not found!", error : err });
  }
};

module.exports = {
  updateSiswa,
  profileSiswa,
  deleteSiswa,
  historySiswa,
  queueSiswa,
  notaSiswa
};
