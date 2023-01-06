/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import router from "../app/Router.js";
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store"
import NewBill from "../containers/NewBill.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import BillsUI from "../views/BillsUI.js";
window.alert = jest.fn();

beforeEach(() => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock }); // utilise le __mocks__/localStorage.js
  window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })); // initialise l'user comme employee avec le localStorage

  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  // je place le DOM
  document.body.innerHTML = NewBillUI();
  //j'utilise la route de la bonne page
  window.onNavigate(ROUTES_PATH.NewBill);
});

afterEach(() => {
  jest.resetAllMocks();
  document.body.innerHTML = "";
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test('Then mail icon in vertical layour should be highlighted', async () => {
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test('Then, the form should appear', async () => {
      await waitFor(() => screen.getByTestId('form-new-bill'))
      const form = screen.getByTestId('form-new-bill')
      expect(form).toBeTruthy()
    })
    test("Then the new bill's form should be loaded with its fields", () => {
      document.body.innerHTML = NewBillUI()
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
      expect(screen.getByRole("button")).toBeTruthy()
    })
    describe("When I uploaded a file with a right extension",()=>{
      test("Then it should not have an error message", ()=>{
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        const fileInput = screen.getByTestId("file");
        const testHandleChangeFile= jest.fn((e) =>
          newBill.handleChangeFile(e));
        const fileJpg = new File(["img"], "Piqueture.jpg", {
          type: "image/jpg",
        });
        fileInput.addEventListener("change",testHandleChangeFile)
        userEvent.upload(fileInput, fileJpg)
        expect(testHandleChangeFile).toHaveBeenCalledTimes(1)
        expect(fileInput.files[0]).toStrictEqual(fileJpg)
      })
    })
  })
  describe("When the form is submitted", ()=>{
    test("Then, it should render 'mes notes de frais' page, ", async  () => {
      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const form= screen.getByTestId("form-new-bill")


      const testHandleSubmit=jest.fn((e)=>newBill.handleSubmit(e))

      form.addEventListener("submit", testHandleSubmit)
      fireEvent.submit(form)


      expect(testHandleSubmit).toHaveBeenCalledTimes(1)
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();

    })
  })
})



/* 
describe('When I uploaded a file with a wrong extension', () => {
  test("Then I can't select upload a non image file", () => {
    document.body.innerHTML = NewBillUI()
    const store = null
    const onNavigate =(pathname) => { document.body.innerHTML = pathname }
    const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
    const handleChangeFile = jest.fn(newBill.handleChangeFile)
    const inputFile = screen.getByTestId('file')
    expect(inputFile).toBeTruthy()
    inputFile.addEventListener('change', handleChangeFile)
    fireEvent.change(inputFile, {target: { files: [new File(['file.pdf'], 'file.pdf', {type: 'file/pdf'})] }})
    expect(handleChangeFile).toHaveBeenCalled()
    expect(inputFile.files[0].name).not.toBe('file.jpg')
    jest.spyOn(window, 'alert').mockImplementation(() => { })
    expect(window.alert).toHaveBeenCalled()
  })
})
 */