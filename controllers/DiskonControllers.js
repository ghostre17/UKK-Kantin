const Diskon = require("../models/Diskon");
const Menu = require("../models/Menu");
const Menu_diskon = require("../models/Menu_diskon");
const Stan = require("../models/Stan");

const createDisc = async (req, res) => {
  try {
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });
    const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir } =
      req.body;

    const diskon = await Diskon.create({
      nama_diskon,
      persentase_diskon,
      tanggal_awal,
      tanggal_akhir,
      id_stan: stan.id,
    });

    res.status(200).json({ message: "Success adding discount!", data: diskon });
  } catch (err) {
    res.status(500).json({ message: "Failed adding discount!", data: err });
  }
};

const getDisc = async (req, res) => {
  try{
    const stan = await Stan.findOne({ where : { id_user : req.user.id}})
    if(stan) {
      const disc = await Diskon.findAll({ where : { id_stan : stan.id}})
      res.status(200).json({ message : "Getting all discount success!", Data : disc})
    }else{
      res.status(404).json({ message : "Discount not found!"})
    }
  } catch(err){
    res.status(500).json({ message : "Error getting discount!"})
  }
}

const assignDisc = async (req, res) => {
  try {
    const { id_menu, id_diskon } = req.body;

    // Cek apakah menu ada
    const menu = await Menu.findOne({ where: { id: id_menu } });
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Cek apakah diskon ada
    const diskon = await Diskon.findOne({ where: { id: id_diskon } });
    if (!diskon) {
      return res.status(404).json({ message: "Discount not found" });
    }

    // Assign diskon ke menu
    const menuDiskon = await Menu_diskon.create({
      id_menu: menu.id,
      id_diskon: diskon.id,
    });

    res.status(201).json({
      message: "Assigning discount to menu is successful!",
      data: menuDiskon,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error assigning discount to menu",
      error: err.message,
    });
  }
};

const deleteDisc = async (req, res) => {
  try {
    const { filter } = req.params;
    const diskon = await Diskon.findByPk(filter);
    if (diskon) {
      await diskon.destroy();
      res.status(200).json({ message: "Deleting discount success!" });
    } else {
      res.status(404).json({ message: "Discount not found!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error deleting discount!" });
  }
};

const disconnectedDisc = async (req, res) => {
  try {
    const { filter } = req.params;
    const assignedDisc = await Menu_diskon.findByPk(filter);
    if (assignDisc) {
      await assignedDisc.destroy();
      res
        .status(200)
        .json({
          message: "Disconnecting discount from menu success!",
          Data: assignDisc,
        });
    } else {
      res.status(404).json({ message: "assinged discount not found!" });
    }
  } catch (err) {
    res.status(500).json({ message: "error disconnecting Disc from menu!" });
  }
};

const getMenuDisc = async (req, res) => {
  try {
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });
    if (stan) {
      const menus = await Menu.findAll({
        where: { id_stan: stan.id },
        include: {
          model: Menu_diskon,
          as: "menu_diskon",
          include: { model: Diskon, as: "diskon" },
        },
      });
      res
        .status(200)
        .json({ message: "Getting discount menu success!", menus });
    } else {
      res.status(404).json({ message: "menudisc not found!" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error getting discount menu", error: err.message });
  }
};

const getDiscMenus = async (req, res) => {
  try {
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });
    if (stan) {
      const discounts = await Diskon.findAll({
        where: { id_stan: stan.id },
        include: {
          model: Menu_diskon,
          as: "menu_diskon",
          include: { model: Menu, as: "menu" },
        },
      });

      res
        .status(200)
        .json({ message: "Getting menu disc success!", discounts });
    } else {
      res.status(404).json({ message: "discmenu not found!" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error getting menu disc", error: err.message });
  }
};

module.exports = {
  createDisc,
  assignDisc,
  getMenuDisc,
  getDiscMenus,
  disconnectedDisc,
  deleteDisc,
  getDisc
};
