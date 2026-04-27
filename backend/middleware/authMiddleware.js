import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
const possibleTokens = [
    "SuperAdminToken",
    "HrToken",
    "EmployeeToken",
    "ManagerToken",
  ];
  let token;

  for (let cookie of possibleTokens) {
    if (req.cookies[cookie]) {
      token = req.cookies[cookie];
      break;
    }
  }
  

  if (!token) return res.status(400).json({ message: "token not exist" });
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decode.id;
    req.userRole = decode.role;
    console.log(decode.role);
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error in verifyTOken" });
  }
};

const onlyHr = (req, res, next) => {
  if (req.userRole !== "Hr")
    return res.status(403).json({ message: "HR access only" });
  next();
};

const managerOnly = (req, res, next) => {
  if (req.userRole !== "Manager") {
    return res.status(403).json({ message: "Manager access only" });
  }
  next();
};

const employeeOnly = (req, res, next) => {
  if (req.userRole !== "Employee") {
    return res.status(403).json({ message: "Employee access only" });
  }
  next();
};

const superAdminOnly = (req, res, next) => {
  if (req.userRole !== "SuperAdmin") {
    return res.status(403).json({ message: "SuperAdmin access only" });
  }
  next();
};

// export { verifyToken, onlyHr, managerOnly, employeeOnly };
export { verifyToken, superAdminOnly, onlyHr, managerOnly, employeeOnly };