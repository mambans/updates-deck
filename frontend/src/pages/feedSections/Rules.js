import React from 'react';
import MyModal from '../../components/mymodal/MyModal';
import { MdFormatListBulleted } from 'react-icons/md';
import { RulesContainer } from './styledComponents';
import Rule from './Rule';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useSetRecoilState } from 'recoil';
import { navigationSidebarOverflowAtom } from '../navigation/atoms';

const WIDTH = 900;
const ITEM_HEIGHT = 60;

const Rules = ({ rules, name, id }) => {
  const setNavigationSidebarOverflow = useSetRecoilState(navigationSidebarOverflowAtom);

  return (
    <MyModal
      trigger={<MdFormatListBulleted size={22} />}
      direction={'top'}
      style={{
        right: '40px',
        top: '0',
        background: 'var(--navigationbarBackground)',
        minHeight: '200px',
        maxHeight: '75vh',
        boxShadow: 'rgba(0, 0, 0, 0.25) 4px 8px 15px',
        width: WIDTH + 'px',
      }}
      onClick={() => setNavigationSidebarOverflow('visible')}
      onClose={() => setNavigationSidebarOverflow(null)}
      relative
    >
      <RulesContainer itemHeight={ITEM_HEIGHT} id='RULES'>
        <Rule height={ITEM_HEIGHT} name={name} id={id} index={0} />
        <TransitionGroup component={null}>
          {rules?.map((rule, index) => {
            return (
              <CSSTransition classNames='ListForm' key={rule.id} timeout={500} unmountOnExit>
                <Rule height={ITEM_HEIGHT} rule={rule} name={name} id={id} index={index + 1} />
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      </RulesContainer>
    </MyModal>
  );
};
export default Rules;
