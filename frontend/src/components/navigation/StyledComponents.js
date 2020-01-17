import styled from "styled-components";

const StyledNavSidebarTrigger = styled.div`
  align-items: center;
  cursor: pointer;
  margin-left: 20px;
  border-radius: 30px;
  -webkit-border-radius: 30px;
  -moz-border-radius: 30px;
  -ms-border-radius: 30px;
  -o-border-radius: 30px;
  height: inherit;
  display: flex;

  img#NavigationProfileImage {
    /* margin-left: 20px; */
    border-radius: 80%;
    -webkit-border-radius: 80%;
    -moz-border-radius: 80%;
    -ms-border-radius: 80%;
    -o-border-radius: 80%;
    object-fit: cover;
    width: 52px;
    height: 80%;
    align-self: center;
    transition: ease-in-out 0.2s;
    -webkit-transition: ease-in-out 0.2s;
    -moz-transition: ease-in-out 0.2s;
    -ms-transition: ease-in-out 0.2s;
    -o-transition: ease-in-out 0.2s;

    border: 2px solid transparent;
    box-shadow: 0px 0px 10px #000000;

    &:hover {
      border: 2px solid rgb(200, 200, 200);
      box-shadow: 0px 0px 15px #000000;
    }
  }
`;

const StyledLoginButton = styled.p`
  margin-top: 0;
  margin-bottom: 0;
  font-size: 1.15rem;
  margin-right: 15px;
`;

export { StyledNavSidebarTrigger, StyledLoginButton };
