import * as React from 'react';
import { styled } from "@mui/material/styles";

import { useSnackbar } from "notistack";

import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

import {
  Box,
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";

import { deleteSpace } from "../../../ipam/ipamAPI";

import { apiRequest } from '../../../../msal/authConfig';

const Spotlight = styled("span")(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.mode === 'dark' ? 'cornflowerblue' : 'mediumblue'
}));

export default function ConfirmDelete(props) {
  const { open, handleClose, space, refresh } = props;

  const { instance, accounts } = useMsal();
  const { enqueueSnackbar } = useSnackbar();

  const [force, setForce] = React.useState(false);
  const [verify, setVerify] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const handleForce = (event) => {
    setForce(event.target.checked);
  };

  const checkForce = () => {
    if(force & !verify) {
      setVerify(true);
    } else {
      const request = {
        scopes: apiRequest.scopes,
        account: accounts[0],
      };
  
      (async () => {
        try {
          setSending(true);
          const response = await instance.acquireTokenSilent(request);
          await deleteSpace(response.accessToken, space, force);
          refresh();
          handleCancel();
        } catch (e) {
          if (e instanceof InteractionRequiredAuthError) {
            instance.acquireTokenRedirect(request);
          } else {
            console.log("ERROR");
            console.log("------------------");
            console.log(e.response.data.error);
            console.log("------------------");
            enqueueSnackbar(e.response.data.error, { variant: "error" });
          }
        } finally {
          setSending(false);
        }
      })();
    }
  };

  const handleCancel = () => {
    setForce(false);
    setVerify(false);
    handleClose();
  };

  return (
    <div>
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>
          Delete Space
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please confirm you want to delete Space <Spotlight>'{space}'</Spotlight>
          </DialogContentText>
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", pt: 3 }}>
            <FormGroup sx={{ pl: 2.5, pr: 1, border: "1px solid rgba(224, 224, 224, 1)", borderRadius: "4px" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={force}
                    disabled={verify || sending}
                    onChange={handleForce}
                  />
                }
                label="Force Delete"
                sx={{ color: "red" }}
              />
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            onClick={checkForce}
            color={verify ? "error" : "primary" }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
