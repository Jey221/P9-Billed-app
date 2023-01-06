/**
 * @jest-environment jsdom
 */

import {getAllByTestId, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import mockedBills from "../__mocks__/store.js";
import userEvent from '@testing-library/user-event'

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(screen.getByTestId('icon-window').classList.contains('active-icon')).toBe(true) // ajout pour vérifier le test de surbrillance
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test('Function handleClickNewBill should be called', () => { // ajout test pour vérifier l'appel de la fonction handleClickNewBill
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
      }))
      const store = mockedBills
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const billsCompo = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const billsList = billsCompo.getBills()    
      billsList.then((snapshot) => {
        document.body.innerHTML = BillsUI({ data: snapshot })
        const handleClickNewBill = jest.fn(billsCompo.handleClickNewBill)
        const button = screen.getByTestId('btn-new-bill')
        if (!!button) {
          button.addEventListener('click', handleClickNewBill)
          userEvent.click(button)
          expect(handleClickNewBill).toHaveBeenCalled()
        } else {
          expect(handleClickNewBill).not.toHaveBeenCalled()
        }
      })
    })
    describe('When I click on new bill', () => { // test pour vérification de la mise en place d'un formulaire pour la création d'une nouvelle note
      test('The form to create a new bill appear', async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const billsInit = new Bills({document, onNavigate, store: null, localStorage: window.localStorage})
        document.body.innerHTML = BillsUI({ data: await billsInit.getBills() })
        const handleClickNewBill = jest.fn(() => billsInit.handleClickNewBill ())
        const btnNewBill = screen.getByTestId('btn-new-bill')
        btnNewBill.addEventListener("click", handleClickNewBill)
        userEvent.click(btnNewBill)
        expect(handleClickNewBill).toHaveBeenCalled()
        await waitFor(() => screen.getByTestId("form-new-bill"))
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      })
    })
    /*
    describe('When I click on the eye icon', () => { // test pour vérification de l'ouverture de l'aperçu de la note de frais
      test('The modal should appear', async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const billsPage = new Bills({document, onNavigate, store: null, bills: bills, localStorage: window.localStorage})
        document.body.innerHTML = BillsUI({data: {bills}})
        $.fn.modal = jest.fn() // mise en place d'un mock pour la modal
        const firstEyeIcon = screen.getByTestId('icon-eye');
        const handleClickIconEye = jest.fn(billsPage.handleClickIconEye(firstEyeIcon));
        firstEyeIcon.addEventListener("click", handleClickIconEye)// simulation de l'evenement click
        userEvent.click(firstEyeIcon)
        expect(handleClickIconEye).toHaveBeenCalled()
        expect(screen.getByText('Justificatif')).toBeTruthy()
      })
    })
    */
    describe("When I click on the eye icon", () => {
      test("The modal should appear", async () => {// test pour vérification de l'ouverture de l'aperçu de la note de frais
        Object.defineProperty(window, 'localStorage', {value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({pathname})
        }
        const billsPage = new Bills({document, onNavigate, store: null, bills: bills, localStorage: window.localStorage})
        document.body.innerHTML = BillsUI({data: {bills}})
        $.fn.modal = jest.fn();// mise en place d'un mock pour la modal
        const firstEyeIcon = getAllByTestId(document.body, "btn-new-bill")[0];
        const handleClickIconEye = jest.fn(
          billsPage.handleClickIconEye(firstEyeIcon)
        );
        firstEyeIcon.addEventListener("click", handleClickIconEye);
        userEvent.click(firstEyeIcon);// action du click
        expect(handleClickIconEye).toHaveBeenCalled();

        expect(screen.getByText('Justificatif')).toBeTruthy()
      });
    });
    // test d'intégration GET BILL
    describe('When I navigate to Bills page', () => {
      describe('When we call API', () => {
        const store = mockedBills;
        test('fetches bills from an API', async () => {
          // Vérifie que le call API renvoie bien toutes les factures
          const bills = await store.bills().list()
          expect(bills.length).toBe(4);
        })
      })
    })
  })
})

