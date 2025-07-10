const User = require("../models/User");
const Siswa = require("../models/Siswa");
const Stan = require("../models/Stan");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashpass = await bcrypt.hash(password, 10);

    if (role === "siswa") {
      const { nama_siswa, alamat, no_telp } = req.body;
      if (!nama_siswa || !alamat || !no_telp) {
        return res.status(400).json({
          message:
            "Siswa role must have 'nama_siswa', 'alamat', and 'no_telp' attributes",
        });
      } else {
        const user = await User.create({
          username,
          email,
          password: hashpass,
          role,
        });
        if (user) {
          await Siswa.create({
            nama_siswa,
            alamat,
            no_telp,
            id_user: user.id,
          });
          res.status(200).json({
            message: "Register Completed",
            data: user,
            as: role,
          });
        }
      }
    } else if (role === "stan") {
      const { nama_stan, nama_pemilik, no_telp } = req.body;

      if (!nama_stan || !nama_pemilik || !no_telp) {
        return res.status(400).json({
          message:
            "Stan role must have 'nama_stan', 'nama_pemilik', and 'no_telp' attributes",
        });
      } else {
        const user = await User.create({
          username,
          email,
          password: hashpass,
          role,
        });
        if (user) {
          const stan = await Stan.create({
            nama_stan,
            nama_pemilik,
            no_telp,
            id_user: user.id,
          });
          res.status(200).json({
            message: "Register Completed",
            data: user,
            as: role,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Register failed", data: err });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email not found!" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Wrong password!" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await user.update({ refresh_token : token})

    res.status(200).json({ message: "Login succeed", token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", data: err });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.header("Authorization")
    const auth = token.split(" ")[1]
    const user = await User.findOne({ where: { refresh_token: auth } });
    if(token && user) {
      await user.update({ refresh_token : null})
      return res.status(200).json({ message: "Logout succeed"});
    }else{
      res.status(401).json({ message: "Unauthorized" });
      console.log(Error)
    }
  } catch (err) {
    return res.status(500).json({ message: "Logout failed", data: err });
  }
}

const findAllUser = async (req, res) => {
  try {
    const users = await User.findAll(); 
    const result = await Promise.all(users.map(async (user) => { 
      let detail = null;
      
      if (user.role === "siswa") {
        detail = await Siswa.findOne({ where: { id_user: user.id } }); 
      } else if (user.role === "stan") {
        detail = await Stan.findOne({ where: { id_user: user.id } }); 
      }

      return {
        user,
        detail
      };
    }));

    res.status(200).json({
      message: "Getting all data completed!",
      data: result, 
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get all data", data: err });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;
  try {
    const user = await User.findByPk(id);
    if (user) {
      let hashas = user.password;
      if (password) {
        hashas = await bcrypt.hash(password, 10);
      }
      await user.update({ username, email, password: hashas, role });
      res.status(200).json({ message: "Update data completed!", data: user });
    } else {
      res.status(404).json({ message: "Cant find user" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to update data", data: err });
  }
};

module.exports = {
  register,
  login,
  logout,
  findAllUser,
  updateUser,
};
