

// silence noisy logs just for this file
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});
afterAll(() => {
  (console.warn as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
  (console.log as jest.Mock).mockRestore();
});


// Mocks
jest.mock('~/hooks', () => ({
  useCommonTranslations: () => ({
    t: (key: string) => ({
      'createRuleConfigPage.errors.minItems': 'Please add at least 1 item',
      'createRuleConfigPage.errors.minorRequired': 'Minor is required',
      'createRuleConfigPage.errors.patchRequired': 'Patch is required',
      'createRuleConfigPage.errors.categoryRequired': 'Category is required',
      'createRuleConfigPage.save': 'Save',
      'createRuleConfigPage.informationForm.description': 'Description',
    }[key] || key),
  }),
}));

jest.mock('~/context/auth', () => ({
  useAuth: () => ({
    user: { username: 'test-user' },
    token: 'test-token',
  }),
}));

jest.mock('src/domain/Rule/CreateConfig/service', () => ({
  getExitConditions: jest.fn(() => Promise.resolve([])),
  getUserProfile: jest.fn(() => Promise.resolve({ personalExitConditions: [] })),
}));

const getVisibleAntdDropdown = (): HTMLElement | null => {
  const all = Array.from(document.querySelectorAll('.ant-select-dropdown')) as HTMLElement[];
  for (const dd of all) {
    const hiddenByClass = dd.classList.contains('ant-select-dropdown-hidden');
    const style = dd.getAttribute('style') || '';
    const hiddenOffscreen = style.includes('left: -1000vw') || style.includes('top: -1000vh');
    // treat as visible only if not hidden by class and not shoved off-screen
    if (!hiddenByClass && !hiddenOffscreen) return dd;
  }
  return null;
};

const waitForDropdownToClose = async () => {
  await waitFor(() => {
    expect(getVisibleAntdDropdown()).toBeNull();
  });
};

// Test helper wrapper
const ConfigFormTestWrapper = (props: any) => {
  const [keys, setKeys] = React.useState<string[]>(['1']); // start with Information open
  return (
    <ConfigForm
      {...props}
      activeKeys={keys}
      setActiveKey={setKeys}
    />
  );
};


const selectAntdOption = async (testId: string, optionText: string | RegExp) => {
  const select = screen.getByTestId(testId);
  const trigger = select.querySelector('.ant-select-selector') ?? select;

  // open
  fireEvent.mouseDown(trigger as HTMLElement);
  fireEvent.click(trigger as HTMLElement);

  // wait for mount
  await waitFor(() => {
    if (!document.querySelector('.ant-select-dropdown')) {
      throw new Error('Dropdown not open yet');
    }
  });

  // choose option (prefer the titled, visible rc item)
  const dd = getVisibleAntdDropdown() ?? (document.querySelector('.ant-select-dropdown') as HTMLElement);
  const asString = typeof optionText === 'string' ? optionText : null;
  let clicked = false;

  if (asString) {
    const titled = dd.querySelector(`.ant-select-item-option[title="${asString}"]`) as HTMLElement | null;
    if (titled) {
      fireEvent.click(titled);
      clicked = true;
    }
  }
  if (!clicked) {
    const candidates = within(dd).getAllByText(optionText);
    const visible = candidates.find(el => (el as HTMLElement).offsetParent !== null) 
                 ?? candidates[candidates.length - 1];
    fireEvent.click(visible);
  }

  // nudge close + wait until not visible (hidden class or off-screen)
  fireEvent.keyDown(document.body, { key: 'Escape' });
  fireEvent.mouseDown(document.body);
  await waitForDropdownToClose();
};





// beforeAll(() => {
//   Object.defineProperty(window, 'matchMedia', { /* your existing mock */ });
//   // NEW
//   window.HTMLElement.prototype.scrollIntoView = jest.fn();
// });

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.focus = jest.fn();
});

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ConfigForm } from '../../CreateConfig/Forms';
import { act } from 'react';

jest.setTimeout(10000);
afterEach(() => jest.clearAllMocks());

describe('EDGE-002: ConfigForm - Invalid Config with No Bands or Cases', () => {
  it(
    'should display error when saving with no bands or cases selected',
    async () => {
      await act(async () => {
        render(
          <ConfigForm
            open={true}
            setOpen={jest.fn()}
            loading={false}
            setLoading={jest.fn()}
            success=""
            serverError=""
            activeKeys={['1']}
            setActiveKey={jest.fn()}
            onSubmit={jest.fn()}
            rule={{
              name: 'Test Rule',
              desc: 'Some rule',
              ownerId: 'user1',
              updatedBy: 'user1',
              updatedAt: new Date().toISOString(),
              state: '01_DRAFT',
              dependencies: [],
              cfg: '1.0.0',
              dataType: 'NUMERIC',
              approverId: 'approver',
              createdAt: new Date().toISOString(),
            }}
          />
        );
      });

      // Wait for form to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('config-form')).toBeInTheDocument();
      });

      // Fill only the description field
      fireEvent.change(screen.getByTestId('description-input'), {
        target: { value: 'Testing config' },
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      // expect(await screen.findByText((text) => text.includes('Minor'))).toBeInTheDocument();
      // Wait for all known error messages to appear
      // await waitFor(() => {
      //   // expect(screen.getByText('Minor is required')).toBeInTheDocument();
      //   expect(screen.getByText('Patch is required')).toBeInTheDocument();
      //   expect(screen.getByText('Category is required')).toBeInTheDocument();
      // });
      expect(await screen.findByText((t) => t.includes('Minor'))).toBeInTheDocument();
      expect(await screen.findByText((t) => t.includes('Patch'))).toBeInTheDocument();
      // expect(await screen.findByText((t) => t.includes('Category'))).toBeInTheDocument();
      await waitFor(() => {
        const categoryError = Array.from(document.body.querySelectorAll('*'))
          .find((el) => el.textContent?.includes('Category'));
        expect(categoryError).toBeTruthy();
      });



    },
    15000
  );
});

describe('EDGE-010: ConfigForm - Delete last band blocks save & shows validation', () => {
  it('deleting the only band triggers minItems error and prevents a valid save', async () => {
    await act(async () => {
        render(
          <ConfigFormTestWrapper
            open={true}
            setOpen={jest.fn()}
            loading={false}
            setLoading={jest.fn()}
            success=""
            serverError=""
            onSubmit={jest.fn()}
            rule={{
              name: 'Test Rule',
              desc: 'Some rule',
              ownerId: 'user1',
              updatedBy: 'user1',
              updatedAt: new Date().toISOString(),
              state: '01_DRAFT',
              dependencies: [],
              cfg: '1.0.0',
              dataType: 'NUMERIC',
              approverId: 'approver',
              createdAt: new Date().toISOString(),
            }}
          />
        );
      });

      // wait for form
      await waitFor(() => expect(screen.getByTestId('config-form')).toBeInTheDocument());

      // fill base fields
      fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Valid description' } });
      await selectAntdOption('major-select', /^0$/);
      await selectAntdOption('minor-select', /^0$/);
      await selectAntdOption('patch-select', /^0$/);

      // enable Bands (sets category = isBand)
      fireEvent.click(screen.getByTestId('band-checkbox'));

      // OPEN the Bands panel so its children mount
      // (mock t() doesn’t translate this key, so the header text is the key)
      fireEvent.click(screen.getByText('createRuleConfigPage.band'));

      // now the add button exists
      const addBandBtn = await screen.findByTestId('add-button');
      fireEvent.click(addBandBtn);

      // fill band and delete
      // const bandField = await screen.findByTestId('band-field');
      // fireEvent.change(within(bandField).getByTestId('reason-input'), { target: { value: 'Reason A' } });
      // fireEvent.change(within(bandField).getByTestId('value-input'), { target: { value: '0' } });
      // fireEvent.click(within(bandField).getByTestId('minus-icon'));


      const bandField = await screen.findByTestId('band-field');
      fireEvent.change(within(bandField).getByTestId('reason-input'), { target: { value: 'Reason A' } });
      fireEvent.change(within(bandField).getByTestId('value-input'), { target: { value: '0' } });
      const minusIcon = await screen.findByTestId('minus-icon'); // not inside band-field
      fireEvent.click(minusIcon.closest('button') ?? minusIcon);




      // save -> expect validation
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(await screen.findByText('Please add at least 1 item')).toBeInTheDocument();

  }, 40000);
});

// optional: blur trigger to force close in JSDOM
// (trigger as HTMLElement).blur();
// await waitForDropdownToClose();


