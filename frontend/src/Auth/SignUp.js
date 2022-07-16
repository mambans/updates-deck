import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import React, { useContext, useReducer, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import LoadingIndicator from '../components/LoadingIndicator';
import useInput from '../hooks/useInput';
import NavigationContext from '../pages/navigation/NavigationContext';
import {
  InlineError,
  StyledCreateForm,
  StyledCreateFormTitle,
} from '../pages/navigation/sidebar/StyledComponents';
import UserPool from './UserPool';

const SignUp = () => {
  const { setSidebarComonentKey } = useContext(NavigationContext);
  const { value: username, bind: bindUsername } = useInput('');
  const { value: email, bind: bindEmail } = useInput('');
  const { value: password, bind: bindPassword } = useInput('');
  const [loading, setLoading] = useState();

  const [error, setError] = useReducer((state, error) => {
    switch (error?.message) {
      case 'User is not confirmed.':
        return 'Check your email for confirmation link';
      case 'Missing required parameter USERNAME':
        return 'Please enter your username';
      case 'User is disabled.':
        return 'Your account is disabled';
      default:
        return error?.message;
    }
  }, null);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setError(null);
    setLoading(true);

    var attributeEmail = new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    });
    UserPool.signUp(username, password, [attributeEmail], null, (error, data) => {
      console.log('error:', error);
      console.log('data:', data);

      console.log(error?.message);
      setError(error);
      setLoading(false);

      if (data) {
        setSidebarComonentKey({
          comp: 'account',
          text: (
            <span style={{ display: 'flex', flexWrap: 'wrap' }}>
              Confirmation link sent to <b>{email}</b>,<span>please check you'r email.</span>
            </span>
          ),
        });
      }
    });
  };

  return (
    <>
      <StyledCreateFormTitle>Sign Up</StyledCreateFormTitle>
      <StyledCreateForm onSubmit={handleSubmit} noValidate validated={true}>
        <Form.Group controlId='formGroupUserName'>
          <Form.Label>Username</Form.Label>
          <Form.Control
            type='text'
            placeholder='Username'
            name='username'
            required
            {...bindUsername}
          />
        </Form.Group>
        <Form.Group controlId='formGroupEmail'>
          <Form.Label>Email address</Form.Label>
          <Form.Control type='email' placeholder='Enter email' required {...bindEmail} />
        </Form.Group>
        <Form.Group controlId='formGroupPassword'>
          <Form.Label>Password</Form.Label>
          <Form.Control type='password' placeholder='Password' required {...bindPassword} />
        </Form.Group>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
          <Button variant='primary' type='submit' disabled={!username || !password || !email}>
            Create
          </Button>
        </div>
        {error && <InlineError>{error}</InlineError>}
      </StyledCreateForm>
      {loading && <LoadingIndicator height={150} width={150} />}
    </>
  );
};
export default SignUp;
