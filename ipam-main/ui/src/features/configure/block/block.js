import * as React from "react";
import { useSelector } from 'react-redux';
import { styled } from "@mui/material/styles";

import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import '@inovua/reactdatagrid-community/theme/default-dark.css'

import { useTheme } from '@mui/material/styles';

import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography
} from "@mui/material";

import {
  DeleteOutline as DeleteOutlineIcon,
  MoreVert as MoreVertIcon,
  GridView as GridViewIcon,
  PieChartOutline as PieChartOutlineIcon,
  SettingsEthernet as SettingsEthernetIcon,
} from "@mui/icons-material";

import AddBlock from "./Utils/addBlock";
import EditVnets from "./Utils/editVnets";
import EditReservations from "./Utils/editReservations";
import ConfirmDelete from "./Utils/confirmDelete";

import { ConfigureContext } from "../configureContext";

import { getAdminStatus } from "../../ipam/ipamSlice";

const GridHeader = styled("div")({
  height: "50px",
  width: "100%",
  display: "flex",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

const GridTitle = styled("div")(({ theme }) => ({
  ...theme.typography.h6,
  width: "80%",
  textAlign: "center",
  alignSelf: "center",
}));

const GridBody = styled("div")({
  height: "100%",
  width: "100%",
});

const gridStyle = {
  height: '100%',
  border: 'none',
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
};

const columns = [
  { name: "name", header: "Name", defaultFlex: 1 },
  { name: "parentSpace", header: "Parent Space", defaultFlex: 1 },
  { name: "cidr", header: "CIDR", defaultFlex: 0.75 },
];

export default function BlockDataGrid(props) {
  const { selectedSpace, selectedBlock, setSelectedBlock } = props;
  const { blocks, refreshing, refresh } = React.useContext(ConfigureContext);

  const [previousSpace, setPreviousSpace] = React.useState(null);
  const [selectionModel, setSelectionModel] = React.useState({});

  const [addBlockOpen, setAddBlockOpen] = React.useState(false);
  const [editVNetsOpen, setEditVNetsOpen] = React.useState(false);
  const [editResvOpen, setEditResvOpen] = React.useState(false);
  const [deleteBlockOpen, setDeleteBlockOpen] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const isAdmin = useSelector(getAdminStatus);

  const theme = useTheme();

  const menuOpen = Boolean(anchorEl);

  const onSpaceChange = React.useCallback(() => {
    if(selectedSpace) {
      if(selectedSpace.name !== previousSpace) {
        setSelectionModel({});
      }
    }

    setPreviousSpace(selectedSpace ? selectedSpace.name : null);
  }, [selectedSpace, previousSpace]);

  React.useEffect(() => {
    onSpaceChange()
  }, [selectedSpace, onSpaceChange]);

  React.useEffect(() => {
    setSelectedBlock(Object.values(selectionModel)[0])
  }, [selectionModel, setSelectedBlock]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddBlock = () => {
    handleMenuClose();
    setAddBlockOpen(true);
  };

  const handleEditVNets = () => {
    handleMenuClose();
    setEditVNetsOpen(true);
  };

  const handleEditResv = () => {
    handleMenuClose();
    setEditResvOpen(true);
  };

  const handleDeleteBlock = () => {
    handleMenuClose();
    setDeleteBlockOpen(true);
  };

  function onClick(data) {
    var id = data.name;
    var newSelectionModel = {};

    setSelectionModel(prevState => {
      if(!prevState.hasOwnProperty(id)) {
        newSelectionModel[id] = data;
      }
      
      return newSelectionModel;
    });
  }

  function NoRowsOverlay() {
    return (
      <React.Fragment>
        { selectedSpace
          ? <Typography variant="overline" display="block" sx={{ mt: 1 }}>
              No Blocks Found in Selected Space
            </Typography>
          : <Typography variant="overline" display="block" sx={{ mt: 1 }}>
              Please Select a Space
            </Typography>
        }
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      { isAdmin &&
        <React.Fragment>
          <AddBlock
            open={addBlockOpen}
            handleClose={() => setAddBlockOpen(false)}
            space={selectedSpace ? selectedSpace.name : null}
            blocks={selectedSpace ? selectedSpace.blocks : null}
            refresh={refresh}
          />
          <EditVnets
            open={editVNetsOpen}
            handleClose={() => setEditVNetsOpen(false)}
            space={selectedSpace ? selectedSpace.name : null}
            block={selectedBlock ? selectedBlock : null}
            refresh={refresh}
            refreshingState={refreshing}
          />
          <ConfirmDelete
            open={deleteBlockOpen}
            handleClose={() => setDeleteBlockOpen(false)}
            space={selectedSpace ? selectedSpace.name : null}
            block={selectedBlock ? selectedBlock.name : null}
            refresh={refresh}
          />
        </React.Fragment>
      }
      <EditReservations
        open={editResvOpen}
        handleClose={() => setEditResvOpen(false)}
        space={selectedSpace ? selectedSpace.name : null}
        block={selectedBlock ? selectedBlock.name : null}
      />
      <GridHeader
        style={{
          borderBottom: "1px solid rgba(224, 224, 224, 1)",
          backgroundColor: selectedBlock ? "rgba(25, 118, 210, 0.12)" : "unset",
        }}
      >
        <Box sx={{ width: "20%" }}></Box>
        <GridTitle>{selectedBlock ? `'${selectedBlock.name}' selected` : "Blocks"}</GridTitle>
        <Box sx={{ width: "20%", display: "flex", justifyContent: "flex-end" }}>
          <React.Fragment>
            <Tooltip title="Actions">
              <IconButton
                aria-label="upload picture"
                component="span"
                onClick={handleMenuClick}
                sx={{ mr: 1.5 }}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="demo-positioned-menu"
              aria-labelledby="demo-positioned-button"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                elevation: 0,
                style: {
                  width: 200,
                },
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
            >
              { isAdmin &&
                <MenuItem
                  onClick={handleAddBlock}
                  disabled={!selectedSpace}
                >
                  <ListItemIcon>
                    <GridViewIcon fontSize="small" />
                  </ListItemIcon>
                  Add Block
                </MenuItem>
              }
              { isAdmin &&
                <MenuItem
                  onClick={handleEditVNets}
                  disabled={!selectedBlock}
                >
                  <ListItemIcon>
                    <SettingsEthernetIcon fontSize="small" />
                  </ListItemIcon>
                  Virtual Networks
                </MenuItem>
              }
              <MenuItem
                onClick={handleEditResv}
                disabled={!selectedBlock}
              >
                <ListItemIcon>
                  <PieChartOutlineIcon fontSize="small" />
                </ListItemIcon>
                Reservations
              </MenuItem>
              { isAdmin &&
                <Divider />
              }
              { isAdmin &&
                <MenuItem
                  onClick={handleDeleteBlock}
                  disabled={!selectedBlock}
                >
                  <ListItemIcon>
                    <DeleteOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  Delete
                </MenuItem>
              }
            </Menu>
          </React.Fragment>
        </Box>
      </GridHeader>
      <GridBody>
        <ReactDataGrid
          theme={theme.palette.mode === 'dark' ? "default-dark" : "default-light"}
          idProperty="name"
          showCellBorders="horizontal"
          showZebraRows={false}
          multiSelect={true}
          showActiveRowIndicator={false}
          enableColumnAutosize={false}
          showColumnMenuGroupOptions={false}
          columns={columns}
          dataSource={selectedSpace ? blocks.filter((block) => block.parentSpace === selectedSpace.name) : []}
          onRowClick={(rowData) => onClick(rowData.data)}
          selected={selectionModel}
          emptyText={NoRowsOverlay}
          style={gridStyle}
        />
      </GridBody>
    </React.Fragment>
  );
}
