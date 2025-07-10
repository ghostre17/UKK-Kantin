const Transaksi = require("../models/Transaksi");
const Detail_transaksi = require("../models/Detail_transaksi");
const Siswa = require("../models/Siswa");
const Stan = require("../models/Stan");
const Menu = require('../models/Menu')
const Menu_diskon = require('../models/Menu_diskon')
const Diskon = require('../models/Diskon')
const { Op } = require("sequelize");

const createTransaksi = async (req, res) => {
  const { filter, filterfood } = req.params;
  const { quantity } = req.body;

  try {
    const siswa = await Siswa.findOne({ where: { id_user: req.user.id } });

    const idStan = await Stan.findByPk(filter);
    const stan = await Stan.findOne({
      where: {
        [Op.or]: [
          { nama_stan: { [Op.like]: `%${filter}%` } },
          { nama_pemilik: { [Op.like]: `%${filter}%` } },
          { no_telp: { [Op.like]: `%${filter}%` } },
        ],
      },
    });

    if (stan || idStan) {
      const menuid = await Menu.findByPk(filterfood);

      if (!menuid) {
        return res.status(404).json({ message: "Cant find menu!" });
      }

      // Cek diskon yang aktif untuk menu ini
      const menuDiskon = await Menu_diskon.findOne({ where: { id_menu: menuid.id } });

      let hargaMenu = menuid.price;
      let totalHarga = hargaMenu * quantity;
      let hargaSetelahDiskon = totalHarga;

      console.log("Menu ditemukan:", menuid);
      console.log("menuDiskon ditemukan:", menuDiskon);

      if (menuDiskon) {
        const diskon = await Diskon.findOne({ 
          where: { 
            id: menuDiskon.id_diskon, 
            tanggal_awal: { [Op.lte]: new Date() }, 
            tanggal_akhir: { [Op.gte]: new Date() }
          } 
        });

        console.log("Diskon ditemukan:", diskon);

        if (diskon) {
          const persentaseDiskon = diskon.persentase_diskon;
          const totalDiskon = totalHarga * (persentaseDiskon / 100); 

          hargaSetelahDiskon = totalHarga - totalDiskon; // ini kurang diskon bosss
        }
      }

      const transaksi = await Transaksi.create({
        id_stan: stan ? stan.id : idStan.id,
        id_siswa: siswa.id,
      });

      const detail_transaksi = await Detail_transaksi.create({
        id_transaksi: transaksi.id,
        quantity,
        id_menu: menuid.id,
        harga_beli: hargaSetelahDiskon, // ini aga ngeselin soalnya human error
      });

      return res.status(201).json({ message: "Sending an order!", data: { transaksi, detail_transaksi } });
    } else {
      return res.status(404).json({ message: "Stan tidak ditemukan!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error!", error: err.message });
  }
};

const cancelTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const transaksi = await Transaksi.findOne({
      where: {
        id,
        status: "belum dikonfirm"
      }
    });
    if (transaksi) {
      await transaksi.destroy()
        res
        .status(200)
        .json({ message: "Cancel success!", data: { transaksi } });
    } else {
      res.status(404).json({ message: "You cant cancel transaction when in under process!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

// Stan Only!
const getTransaksi = async (req, res) => {
  try {
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });
    if (stan) {
      const transaksi = await Transaksi.findAll({ 
        where: { id_stan: stan.id,  
        status: "sampai"
      }});
      
      if (transaksi.length > 0) {
        const detail_transaksi = await Promise.all(
          transaksi.map(async (trx) => {
            return await Detail_transaksi.findAll({ where: { id_transaksi: trx.id } });
          })
        );
        
        // Gabungkan transaksi dan detail transaksi
        const result = transaksi.map((trx, index) => ({
          transaksi: trx,
          detail_transaksi: detail_transaksi[index],
        }));

        res.status(200).json({ message: "Getting transaction completed!", data: result });
      } else {
        res.status(404).json({ message: "No transactions found for this stan" });
      }
    } else {
      res.status(404).json({ message: "Stan not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error getting transaction", error: err.message });
  }
};

const searchTransaksi = async (req, res) => {
  try {
    const { filter } = req.params
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });
    if (stan) {
      const transaksi = await Transaksi.findAll({ 
        where: { id_stan: stan.id,
          [Op.or] : [
            { tanggal: { [Op.like]: `%${filter}%` } },
            { id_stan: { [Op.like]: `%${filter}%` } },
            { id_siswa: { [Op.like]: `%${filter}%` } },
            { status: { [Op.like]: `%${filter}%` } },
            { id: { [Op.like]: `%${filter}%`}}
          ]
         }
      });
      
      if (transaksi.length > 0) {
        const detail_transaksi = await Promise.all(
          transaksi.map(async (trx) => {
            return await Detail_transaksi.findAll({ where: { id_transaksi: trx.id } });
          })
        );
        
        // Gabungkan transaksi dan detail transaksi
        const result = transaksi.map((trx, index) => ({
          transaksi: trx,
          detail_transaksi: detail_transaksi[index],
        }));

        res.status(200).json({ message: "Getting transaction completed!", data: result });
      } else {
        res.status(404).json({ message: "No transactions found for this stan" });
      }
    } else {
      res.status(404).json({ message: "Stan not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error getting transaction", error: err.message });
  }
};

const queueTransaksi = async (req, res) => {
  try {
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });
    if (stan) {
      const transaksi = await Transaksi.findAll({ 
        where: { id_stan: stan.id ,  
        status: { [Op.ne]: "sampai"}
        }
      });
      
      if (transaksi.length > 0) {
        const detail_transaksi = await Promise.all(
          transaksi.map(async (trx) => {
            return await Detail_transaksi.findAll({ where: { id_transaksi: trx.id } });
          })
        );
        
        // Gabungkan transaksi dan detail transaksi
        const result = transaksi.map((trx, index) => ({
          transaksi: trx,
          detail_transaksi: detail_transaksi[index],
        }));

        res.status(200).json({ message: "Getting queue transaction completed!", data: result });
      } else {
        res.status(404).json({ message: "No queue transactions found for this stan" });
      }
    } else {
      res.status(404).json({ message: "Stan not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error getting transaction", error: err.message });
  }
};

const updateTransaksi = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const transaksi = await Transaksi.findByPk(id);
    if (transaksi) {
      await transaksi.update({ status });
      res
        .status(200)
        .json({ message: "Update success!", data: { transaksi, status } });
    } else {
      res.status(500).json({ message: "Transaksi not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};



module.exports = {
  createTransaksi,
  updateTransaksi,
  getTransaksi,
  queueTransaksi,
  searchTransaksi,
  cancelTransaction
};
