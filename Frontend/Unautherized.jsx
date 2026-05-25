
import React from "react";
import { Button } from "@mui/material";

const Unauthorized = () => (
  <div style={{ textAlign: "center", marginTop: "5rem" }}>
    <h2>🚫 Access Denied</h2>
    <p>You don't have permission to view this page.</p>
    <Button href="/" variant="contained" color="primary">
      Go Home
    </Button>
  </div>
);

export default Unauthorized;