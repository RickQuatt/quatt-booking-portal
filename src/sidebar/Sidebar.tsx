import React from "react";

import classes from "./Sidebar.module.css";
import { Button } from "../ui-components/button/Button";
import classNames from "classnames";
import { Link } from "wouter";

export function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <>
      <Button
        className={classNames(
          classes["toggle-sidebar-button"],
          !isOpen && classes["toggle-sidebar-button-closed"],
        )}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      >
        ☰
      </Button>
      <div
        className={classNames(
          classes.sidebar,
          !isOpen && classes["sidebar-closed"],
        )}
      >
        <div className={classes["sidebar-content"]}>
          <Link href={`/dashboard`}>
            <SidebarButton>CIC Dashboard</SidebarButton>
          </Link>
          <Link href={`/cicHealth`}>
            <SidebarButton>CIC Health Check List</SidebarButton>
          </Link>
          <Link href={`/cics`}>
            <SidebarButton>CIC List</SidebarButton>
          </Link>
          <Link href={`/installers`}>
            <SidebarButton>Installers</SidebarButton>
          </Link>
        </div>
      </div>
    </>
  );
}

function SidebarButton(
  props: React.PropsWithChildren<{ onClick?: () => void }>,
) {
  return (
    <div className={classes["sidebar-button"]} onClick={props.onClick}>
      {props.children}
    </div>
  );
}
