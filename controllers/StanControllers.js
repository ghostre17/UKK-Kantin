const Stan = require("../models/Stan");
const User = require("../models/User");
const Transaksi = require("../models/Transaksi");
const Detail_transaksi = require("../models/Detail_transaksi");
const moment = require("moment");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

// Only Stan
const updateStan = async (req, res) => {
  const { username, email, password, nama_stan, nama_pemilik, no_telp } =
    req.body;
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });
    if (user && stan) {
      let hashas = user.password;
      if (password) {
        hashas = await bcrypt.hashSync(password, 10);
      }
      await user.update({ username, email, password: hashas });
      await stan.update({ nama_stan, nama_pemilik, no_telp });
      res.status(200).json({ message: "Data updated", data: { user, stan } });
    } else {
      res.status(404).json({ message: "User or Stan not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Updating data failed", error: err });
  }
};

const profileStan = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });

    if (!user || !stan) {
      return res
        .status(404)
        .json({ message: "User atau Stan tidak ditemukan" });
    }

    const transaksiSampai = await Transaksi.findAll({
      where: { id_stan: stan.id, status: "sampai" },
    });

    let totalInterest = 0;

    for (const trx of transaksiSampai) {
      const details = await Detail_transaksi.findAll({
        where: { id_transaksi: trx.id },
      });

      for (const item of details) {
        totalInterest += item.harga_beli;
      }
    }

    res.status(200).json({
      message: "Profile dan interest berhasil diambil",
      data: {
        user,
        stan,
        interest: totalInterest || 0,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal ambil profile", error: err.message });
  }
};

const incomeStan = async (req, res) => {
  try {
    const { start, end } = req.query;
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });
    if (stan) {
      const dateFilter = {};

      if (start && end) {
        dateFilter.createdAt = {
          [Op.between]: [new Date(start), new Date(end)],
        };
      } else if (start) {
        dateFilter.createdAt = { [Op.gte]: new Date(start) };
      } else if (end) {
        dateFilter.createdAt = { [Op.lte]: new Date(end) };
      }

      const transaksi = await Transaksi.findAll({
        where: { id_stan: stan.id, status: "sampai", ...dateFilter },
        order: [["createdAt", "ASC"]],
      });

      const incomePerDay = {};
      const incomePerMonth = {};

      for (const trx of transaksi) {
        const details = await Detail_transaksi.findAll({
          where: { id_transaksi: trx.id },
        });

        const trxDate = moment(trx.createdAt).format("YYYY-MM-DD");
        const trxMonth = moment(trx.createdAt).format("YYYY-MM");

        let total = 0;
        for (const item of details) {
          total += item.harga_beli;
        }

        if (!incomePerDay[trxDate]) incomePerDay[trxDate] = 0;
        incomePerDay[trxDate] += total;

        if (!incomePerMonth[trxMonth]) incomePerMonth[trxMonth] = 0;
        incomePerMonth[trxMonth] += total;
      }

      res.status(200).json({
        message: "Sucess getting income!",
        incomePerDay,
        incomePerMonth,
      });
    } else {
      res.status(404).json({ message: "Stan not found!" });
    }
  } catch (err) {
    res.status(500).json({ message: `Error! : ${err}` });
  }
};

const deleteStan = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });
    if (user && stan) {
      await user.destroy();
      await stan.destroy();
      res.status(200).json({ message: "Data deleted", data: { user, stan } });
    } else {
      res.status(404).json({ message: "User or Stan not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Deleting data failed", error: err });
  }
};

// Public
const getAllStan = async (req, res) => {
  try {
    const stan = await Stan.findAll();
    if (stan) {
      res.status(200).json({ message: "Data found", data: stan });
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error get all data", error: err });
  }
};

const getStan = async (req, res) => {
  const { filter } = req.params;
  try {
    const stan = await Stan.findAll({
      where: {
        [Op.or]: [
          { nama_stan: { [Op.like]: `%${filter}%` } },
          { nama_pemilik: { [Op.like]: `%${filter}%` } },
          { no_telp: { [Op.like]: `%${filter}%` } },
          { id: { [Op.like]: `%${filter}%` } },
        ],
      },
    });
    if (stan) {
      res.status(200).json({ message: "Data found", data: stan });
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to get data", error: err });
  }
};

module.exports = {
  incomeStan,
  profileStan,
  deleteStan,
  getStan,
  updateStan,
  getAllStan,
};
