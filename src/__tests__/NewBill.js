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

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I add a new bill", () => {
    test("Then it creates a new bill", () => {
      jest.spyOn(mockStore, "bills")
      //page NewBill
      // localStorage should be populated with form data
        Object.defineProperty(window, 'localStorage', {
              value: {
                getItem: jest.fn(() =>
                    JSON.stringify({
                      email: 'email@test.com',
                    })
                ),
              },
              writable: true,
            })
      
            // we have to mock navigation to test it
            const onNavigate = (pathname) => {
              document.body.innerHTML = ROUTES({ pathname })
            }
      
            //initialisation NewBill
            const newBill = new NewBill({
              document,
              onNavigate,
              localStorage: window.localStorage,
            })      
      document.body.innerHTML = NewBillUI()
      // initialisation champs bills
      const inputData = {
        type: 'Transports',
        name: 'Test',
        datepicker: '2021-05-26',
        amount: '100',
        vat: '10',
        pct: '19',
        commentary: 'Test',
        file: new File(['test'], 'test.png', { type: 'image/png' }),
      }
      // récupération éléments de la page
      const formNewBill = screen.getByTestId('form-new-bill')
      const inputExpenseName = screen.getByTestId('expense-name')
      const inputExpenseType = screen.getByTestId('expense-type')
      const inputDatepicker = screen.getByTestId('datepicker')
      const inputAmount = screen.getByTestId('amount')
      const inputVAT = screen.getByTestId('vat')
      const inputPCT = screen.getByTestId('pct')
      const inputCommentary = screen.getByTestId('commentary')
      const inputFile = screen.getByTestId('file')

      // simulation de l'entrée des valeurs
      fireEvent.change(inputExpenseType, {
        target: { value: inputData.type },
      })
      expect(inputExpenseType.value).toBe(inputData.type)

      fireEvent.change(inputExpenseName, {
        target: { value: inputData.name },
      })
      expect(inputExpenseName.value).toBe(inputData.name)

      fireEvent.change(inputDatepicker, {
        target: { value: inputData.datepicker },
      })
      expect(inputDatepicker.value).toBe(inputData.datepicker)

      fireEvent.change(inputAmount, {
        target: { value: inputData.amount },
      })
      expect(inputAmount.value).toBe(inputData.amount)

      fireEvent.change(inputVAT, {
        target: { value: inputData.vat },
      })
      expect(inputVAT.value).toBe(inputData.vat)

      fireEvent.change(inputPCT, {
        target: { value: inputData.pct },
      })
      expect(inputPCT.value).toBe(inputData.pct)

      fireEvent.change(inputCommentary, {
        target: { value: inputData.commentary },
      })
      expect(inputCommentary.value).toBe(inputData.commentary)

      userEvent.upload(inputFile, inputData.file)
      expect(inputFile.files[0]).toStrictEqual(inputData.file)
      expect(inputFile.files).toHaveLength(1)

      //déclenchement de l'événement
      const handleSubmit = jest.fn(newBill.handleSubmit)
      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill)
      expect(handleSubmit).toHaveBeenCalled()
    })
    test("Then it fails with a 404 message error", async() => {
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    })
    test("Then it fails with a 500 message error", async() => {
      const html = BillsUI({ error: 'Erreur 500' })
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    })

  })
})

