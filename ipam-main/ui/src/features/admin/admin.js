import * as React from "react";
import { styled } from '@mui/material/styles';

import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { callMsGraphUsersFilter } from "../../msal/graph";

import { useSnackbar } from 'notistack';

import { isEqual, throttle } from 'lodash';

import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import '@inovua/reactdatagrid-community/theme/default-dark.css'

import { useTheme } from '@mui/material/styles';

import {
  Box,
  Tooltip,
  IconButton,
  Autocomplete,
  TextField,
  CircularProgress,
  Popper,
  Typography
}  from "@mui/material";

import {
  SaveAlt,
  HighlightOff
} from "@mui/icons-material";

import Shrug from "../../img/pam/Shrug";

import {
  getAdmins,
  replaceAdmins
} from "../ipam/ipamAPI";

import { apiRequest } from "../../msal/authConfig";

// Page Styles

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  height: "calc(100vh - 160px)"
}));

const MainBody = styled("div")({
  display: "flex",
  height: "100%",
  width: "100%",
  flexDirection: "column",
});

const FloatingHeader = styled("div")(({ theme }) => ({
  ...theme.typography.h6,
  display: "flex",
  flexDirection: "row",
  height: "7%",
  width: "100%",
  border: "1px solid rgba(224, 224, 224, 1)",
  borderRadius: "4px",
  marginBottom: theme.spacing(3)
}));

const HeaderTitle = styled("div")(({ theme }) => ({
  ...theme.typography.h6,
  width: "80%",
  textAlign: "center",
  alignSelf: "center",
}));

const DataSection = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  borderRadius: "4px",
  marginBottom: theme.spacing(1.5)
}));

// Grid Styles

const GridBody = styled("div")({
  height: "100%",
  width: "100%"
});

const gridStyle = {
  height: '100%',
  border: "1px solid rgba(224, 224, 224, 1)",
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
};

export default function Administration() {
  const { instance, accounts } = useMsal();
  const { enqueueSnackbar } = useSnackbar();

  const [admins, setAdmins] = React.useState(null);
  const [loadedAdmins, setLoadedAdmins] = React.useState([]);
  const [selectionModel, setSelectionModel] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState(null);
  const [input, setInput] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const [sending, setSending] = React.useState(false);

  const theme = useTheme();

  const adminLoadedRef = React.useRef(false);

  const columns = [
    { name: "name", header: "Name", lockable: false, defaultFlex: 0.5 },
    { name: "email", header: "Email", lockable: false, defaultFlex: 1 },
    { name: "id", header: "Object ID", lockable: false, defaultFlex: 0.75 },
    { name: "delete", header: "Delete", width: 50, resizable: false, hideable: false, showColumnMenuTool: false, renderHeader: () => "", render: ({data}) => renderDelete(data) }
  ];

  const filterValue = [
    { name: 'name', operator: 'contains', type: 'string', value: '' },
    { name: 'email', operator: 'contains', type: 'string', value: '' },
    { name: 'id', operator: 'contains', type: 'string', value: '' }
  ];

  const usersLoading = open && !options;
  const unchanged = isEqual(admins, loadedAdmins);

  const SearchUsers = React.useCallback((nameFilter) => {
    const request = {
      scopes: ["Directory.Read.All"],
      account: accounts[0],
    };

    (async () => {
      try {
        setOptions(null);
        const response = await instance.acquireTokenSilent(request);
        const userData = await callMsGraphUsersFilter(response.accessToken, nameFilter);
        setOptions(userData.value);
      } catch (e) {
        if (e instanceof InteractionRequiredAuthError) {
          instance.acquireTokenRedirect(request);
        } else {
          console.log("ERROR");
          console.log("------------------");
          console.log(e);
          console.log("------------------");
          enqueueSnackbar(e.response.data.error, { variant: "error" });
        }
      }
    })();
  }, [accounts, enqueueSnackbar, instance]);

  const fetchUsers = React.useMemo(() => throttle((input) => SearchUsers(input), 500), [SearchUsers]);

  const refreshData = React.useCallback(() => {
    const request = {
      scopes: apiRequest.scopes,
      account: accounts[0],
    };

    (async () => {
      try {
        // setLoading(true);
        const response = await instance.acquireTokenSilent(request);
        const data = await getAdmins(response.accessToken);
        setAdmins(data);
        setLoadedAdmins(data);
      } catch (e) {
        if (e instanceof InteractionRequiredAuthError) {
          instance.acquireTokenRedirect(request);
        } else {
          console.log("ERROR");
          console.log("------------------");
          console.log(e);
          console.log("------------------");
          enqueueSnackbar("Error fetching admins", { variant: "error" });
        }
      } finally {
        // setLoading(false);
      }
    })();
  }, [accounts, enqueueSnackbar, instance]);

  React.useEffect(() => {
    if(!adminLoadedRef.current) {
      adminLoadedRef.current = true;

      refreshData();
    }
  }, [refreshData]);

  React.useEffect(() => {
    if(open) {
      let active = true;

      if (active) {
        fetchUsers(input);
      }

      return () => {
        active = false;
      };
    }
  }, [open, input, fetchUsers]);

  React.useEffect(() => {
    if (!open) {
      setOptions(null);
    }
  }, [input, open]);

  React.useEffect(() => {
    admins && setLoading(false);
  }, [admins]);

  function onSave() {
    const request = {
      scopes: apiRequest.scopes,
      account: accounts[0],
    };

    (async () => {
      try {
        setSending(true);
        const response = await instance.acquireTokenSilent(request);
        await replaceAdmins(response.accessToken, admins);
        enqueueSnackbar("Successfully updated admins", { variant: "success" });
        refreshData();
      } catch (e) {
        if (e instanceof InteractionRequiredAuthError) {
          instance.acquireTokenRedirect(request);
        } else {
          console.log("ERROR");
          console.log("------------------");
          console.log(e);
          console.log("------------------");
          enqueueSnackbar(e.response.data.error, { variant: "error" });
        }
      } finally {
        setSending(false);
      }
    })();
  }

  function renderDelete(data) {  
    const flexCenter = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }

    return (
      <Tooltip title="Delete">
        <span style={{...flexCenter}}>
          <IconButton
            color="error"
            sx={{
              padding: 0,
              display: (isEqual([data.id], Object.keys(selectionModel))) ? "flex" : "none"
            }}
            disableFocusRipple
            disableTouchRipple
            disableRipple
            onClick={() => setAdmins(admins.filter(x => x.id !== data.id))}
          >
            <HighlightOff />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  function handleAdd(user) {
    let newAdmin = {
      name: user.displayName,
      id: user.id,
      email: user.userPrincipalName,
    };

    if(!admins.find(obj => { return obj.id === user.id })) {
      setAdmins((admins) => [...admins, newAdmin]);
    } else {
      console.log("Admin already added!");
      enqueueSnackbar('Admin already added!', { variant: 'error' });
    }
    
    setSelected(null);
  }

  const popperStyle = {
    popper: {
      width: "fit-content"
    }
  };

  const MyPopper = function (props) {
    return <Popper {...props} style={{ popperStyle }} placement="bottom-start" />;
  };

  function onClick(data) {
    var id = data.id;
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
        <Shrug />
        <Typography variant="overline" display="block"  sx={{ mt: 1 }}>
          Nothing yet...
        </Typography>
      </React.Fragment>
    );
  }

  return (
    <Wrapper>
      <MainBody>
        <FloatingHeader>
          <Box sx={{ width: "35%" }}>
            <Autocomplete
              PopperComponent={MyPopper}
              key="12345"
              id="asynchronous-demo"
              size="small"
              autoHighlight
              blurOnSelect={true}
              forcePopupIcon={false}
              sx={{
                ml: 2,
                width: 300
              }}
              open={open}
              value={selected}
              onOpen={() => {
                setOpen(true);
              }}
              onClose={() => {
                setOpen(false);
              }}
              onInputChange={(event, newInput) => {
                setInput(newInput);
              }}
              onChange={(event, newValue) => {
                newValue ? handleAdd(newValue) : setSelected(null);
              }}
              isOptionEqualToValue={(option, value) => option.displayName === value.displayName}
              getOptionLabel={(option) => `${option.displayName} (${option.userPrincipalName})`}
              options={options || []}
              loading={usersLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="User Search"
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
          </Box>
          <HeaderTitle>IPAM Admins</HeaderTitle>
          <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ width: "35%", ml: 2, mr: 2 }}>
            <Tooltip title="Save" >
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                style={{
                  visibility: unchanged ? 'hidden' : 'visible'
                }}
                disabled={sending}
                onClick={onSave}
              >
                <SaveAlt />
              </IconButton>
            </Tooltip>
          </Box>
        </FloatingHeader>
        <DataSection>
          <GridBody>
            <ReactDataGrid
              theme={theme.palette.mode === 'dark' ? "default-dark" : "default-light"}
              idProperty="id"
              showCellBorders="horizontal"
              showZebraRows={false}
              multiSelect={true}
              showActiveRowIndicator={false}
              enableColumnAutosize={false}
              showColumnMenuGroupOptions={false}
              columns={columns}
              loading={loading}
              dataSource={admins || []}
              defaultFilterValue={filterValue}
              onRowClick={(rowData) => onClick(rowData.data)}
              selected={selectionModel}
              emptyText={NoRowsOverlay}
              style={gridStyle}
            />
          </GridBody>
        </DataSection>
      </MainBody>
    </Wrapper>
  );
}
