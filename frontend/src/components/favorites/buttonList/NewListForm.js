import React, { useContext, useState } from 'react';
import { Form } from 'react-bootstrap';
import { MdAddCircle } from 'react-icons/md';
import axios from 'axios';

import { FormButton, FormGroup, Label } from './../StyledComponents';
import { getCookie } from '../../../util/Utils';
import { parseNumberAndString } from './../dragDropUtils';
import FavoritesContext from '../FavoritesContext';

const useInput = (initialValue) => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    setValue,
    reset: () => setValue(''),
    manualSet: {
      onClick: (event) => setValue(event.target.textContent),
    },
    bind: {
      value,
      onChange: (event) => setValue(event.target.value),
    },
  };
};

export default ({ item }) => {
  const { value: listName, bind: bindListName, reset: resetListName, setValue } = useInput('');
  const { lists, setLists } = useContext(FavoritesContext);

  const addFunc = async (list_Name, item) => {
    const newVideo = Array.isArray(item) ? item : [parseNumberAndString(item)];
    const newListObj = {
      name: list_Name,
      items: newVideo.filter((i) => i),
    };

    setLists((curr) => ({ ...curr, [list_Name]: newListObj }));
    resetListName();

    setTimeout(() => {
      document
        .getElementById(list_Name)
        .scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }, 0);

    await axios
      .put(`https://44rg31jaa9.execute-api.eu-north-1.amazonaws.com/Prod/savedlists`, {
        username: getCookie(`AioFeed_AccountName`),
        videosObj: newListObj,
        listName: list_Name,
        authkey: getCookie(`AioFeed_AuthKey`),
      })
      .catch((e) => console.error(e));
  };

  const CheckForNameAvaliability = !Boolean(
    lists &&
      Object.values(lists).find((list) => list.name?.toLowerCase() === listName?.toLowerCase())
  );

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setValue(listName.trim());

    if (Boolean(listName) || CheckForNameAvaliability) addFunc(listName, item);
  };

  return (
    <Form noValidate onSubmit={handleSubmit} style={{ minWidth: '175px' }}>
      <FormGroup controlId='formGroupChannel'>
        <Label>
          <Form.Control
            type='text'
            placeholder='list name..'
            required
            {...bindListName}
            isInvalid={!CheckForNameAvaliability}
          />
          <Form.Control.Feedback type='invalid' style={{ width: 'max-content' }}>
            List already exists
          </Form.Control.Feedback>
        </Label>
        <FormButton
          type='submit'
          variant='primary'
          disabled={!listName || !CheckForNameAvaliability}
        >
          <MdAddCircle size={20} type='submit' />
        </FormButton>
      </FormGroup>
    </Form>
  );
};
