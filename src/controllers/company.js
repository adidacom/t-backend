import { CompanyService } from '../services';
import { companyResponse, companyListForSearchingResponse } from './responses/company.response';

export async function getCompanyById(req, res, next) {
  try {
    const { id } = req.params;
    const companyInstance = await CompanyService.getCompanyById(id);
    res.status(200);
    res.send(companyResponse(companyInstance));
  } catch (errors) {
    next(errors);
  }
}

export async function getCompanyByRef(req, res, next) {
  try {
    const { ref } = req.params;
    const companyInstance = await CompanyService.getCompanyByRef(ref);
    res.status(200);
    res.send(companyResponse(companyInstance));
  } catch (errors) {
    next(errors);
  }
}

export async function getAllCompaniesForSearching(req, res, next) {
  try {
    const companies = await CompanyService.getAllCompanies();
    res.status(200);
    res.send(companyListForSearchingResponse(companies));
  } catch (errors) {
    next(errors);
  }
}
