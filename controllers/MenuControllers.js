const Menu = require("../models/Menu");
const Stan = require("../models/Stan");
const { Op } = require("sequelize");

// Stan Only
const getOwnMenu = async (req, res) => {
  try {
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });

    if (stan) {
      const menus = await Menu.findAll({ where: { id_stan: stan.id } });
      res.status(200).json({ message: "Your menus", result: menus });
    } else {
      return res.status(404).json({ message: "Stan not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Cant retrieve menus", error: err });
  }
};

const createMenu = async (req, res) => {
  try {
    const stan = await Stan.findOne({ where: { id_user: req.user.id } });
    const { food, description, price, category } = req.body;

    const foto = req.file ? req.file.filename : null;
    if (!foto) {
      return res.status(400).json({ message: "Foto is required" });
    }

    const menu = await Menu.create({
      food,
      description,
      price,
      category,
      id_stan: stan.id,
      foto,
    });
    res
      .status(200)
      .json({ message: "Creating new menu Completed", result: menu });
  } catch (err) {
    res.status(500).json({ message: "Cant create new menu", error: err });
  }
};

const updateMenu = async (req, res) => {
  const { id } = req.params;
  const { food, description, price, category, foto } = req.body;
  try {
    const menu = await Menu.findByPk(id);
    if (menu) {
      await menu.update({ food, description, price, category, foto });
      res.status(200).json({ message: "Update menu completed", result: menu });
    } else {
      res.status(404).json({ message: "Menu not Found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating menu", error: err });
  }
};

const deleteMenu = async (req, res) => {
  const { id } = req.params;
  try {
    const menu = await Menu.findByPk(id);
    if (menu) {
      await menu.destroy();
      res.status(200).json({ message: "Delete menu completed", result: menu });
    } else {
      res.status(404).json({ message: "Menu not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error deleting menu", error: err });
  }
};

// Public
const findMenu = async (req, res) => {
  const { filter, filterfood } = req.params;
  try {
    const stan = await Stan.findOne({
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
      const filtermenu = await Menu.findAll({
        where: {
          id_stan: stan.id,
          [Op.or]: [
            { food: { [Op.like]: `%${filterfood}%` } },
            { description: { [Op.like]: `%${filterfood}%` } },
            { price: { [Op.like]: `%${filterfood}%` } },
            { category: { [Op.like]: `%${filterfood}%` } },
          ],
        },
      });

      if (filtermenu.length > 0) {
        res.status(200).json({
          message: "Find data by filter completed",
          result: { stan, filtermenu },
        });
      } else {
        res.status(404).json({ message: "Data not found" });
      }
    }
  } catch (err) {
    res.status(500).json({ message: "Error finding menu", error: err });
  }
};

const getMenu = async (req, res) => {
  const { filter } = req.params;
  try {
    const stan = await Stan.findOne({
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
      const menu = await Menu.findAll({ where: { id_stan: stan.id } });
      res
        .status(200)
        .json({ message: "Getting all data Complete", data: { stan, menu } });
    } else {
      res.status(404).json({ message: "Data Not Found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error getting all data", error: err });
  }
};

module.exports = {
  getMenu,
  createMenu,
  findMenu,
  updateMenu,
  deleteMenu,
  getOwnMenu,
};
