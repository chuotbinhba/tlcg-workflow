        const data = (function(b64){
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder('utf-8').decode(bytes));
})("eyJmb3JtX3RpdGxlIjoiUEhJ4bq+VSBUSFUvQ0hJIiwidm91Y2hlcl90eXBlcyI6WyJUaHUiLCJDaGkiXSwiY3VycmVuY3lfb3B0aW9ucyI6WyJWTsSQIiwiVVNEIiwiRVVSIl0sImNvbXBhbnlfbmFtZXMiOlsiQ8OUTkcgVFkgVE5ISCBUxq8gVuG6pE4gVExDIiwiQ8OUTkcgVFkgVE5ISCBFR0cgVkVOVFVSRVMiLCJDw5RORyBUWSBD4buUIFBI4bqmTiDEkOG6plUgVMavIENISU5IIFBIT05HIiwiQ8OUTkcgVFkgVE5ISCBNRURJQSBJTlNJREVSIiwiQ8OUTkcgVFkgQ+G7lCBQSOG6pk4gxJDhuqZVIFTGryBUTEMgR1JPVVAiLCJDw5RORyBUWSBD4buUIFBI4bqmTiBXT1JLU01BUlQiLCJDw5RORyBUWSBD4buUIFBI4bqmTiBJTlNJREVSUyIsIkPDlE5HIFRZIFROSEggRUdHIFZFTlRVUkVTIiwiQ8OUTkcgVFkgVFLDgUNIIE5ISeG7hk0gSOG7rlUgSOG6oE4gROG7ikNIIFbhu6QgUklPVCBHQU1FUyJdLCJlbXBsb3llZV9uYW1lcyI6WyJMw6ogTmfDom4gQW5oIiwiTmd1eeG7hW4gVsSDbiBDaGluaCIsIkzDqiBUaMO5eSBMaW5oIiwiTmd1eeG7hW4gTOG7sWMiLCJMw6ogTWluaCIsIkzDqiBNaW5oIEFuaCIsIk5ndXnhu4VuIFRo4buLIE5oYW5oIiwiTMawIEvhu7MgTmjDoyIsIk5ndXllbiBQaG9uZyIsIlRy4bqnbiBUaGFuaCIsIkFuaCBUaMawIFRow6FpIFRo4buLIiwiTmd1eeG7hW4gTMawIEFuaCBUaMawIiwiTmd1eWVuIFRpbW90aHkiLCJOZ3V5ZW4gVGluYSBMaW5oIiwiUGjhuqFtIFRyw60iXSwiYXBwcm92ZXJfbmFtZXMiOlsiTMOqIE5nw6JuIEFuaCIsIk5ndXnhu4VuIFbEg24gQ2hpbmgiLCJMw6ogVGjDuXkgTGluaCIsIk5ndXnhu4VuIEzhu7FjIiwiTMOqIE1pbmgiLCJMw6ogTWluaCBBbmgiLCJOZ3V54buFbiBUaOG7iyBOaGFuaCIsIkzGsCBL4buzIE5ow6MiLCJOZ3V5ZW4gUGhvbmciLCJUcuG6p24gVGhhbmgiLCJBbmggVGjGsCBUaMOhaSBUaOG7iyIsIk5ndXnhu4VuIEzGsCBBbmggVGjGsCIsIk5ndXllbiBUaW1vdGh5IiwiTmd1eWVuIFRpbmEgTGluaCIsIlBo4bqhbSBUcsOtIl0sImNvbXBhbmllc19kYXRhIjpbeyJUw6puIGPDtG5nIHR5IHZp4bq/dCB04bqvdCI6IlRMQyIsIlTDqm4gY8O0bmcgdHkiOiJDw5RORyBUWSBUTkhIIFTGryBW4bqkTiBUTEMiLCLEkOG7i2EgY2jhu4kiOiJCLjMuMDksIFThuqduZyAzLCBMw7QgQiwgU+G7kSAzNC0zNSBC4bq/biBWw6JuIMSQ4buTbiwgUGjGsOG7nW5nIDEzLCBRdeG6rW4gNCwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFtIiwiTcOjIHPhu5EgdGh14bq/IjoiMDMxMzUxOTc1NiIsIkVtYWlsIMSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoiYW5oLmxlQG1lZGlhaW5zaWRlci52biIsIsSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoiTMOqIE5nw6JuIEFuaCIsIkNo4buvIGvDvSDEkOG6oWkgZGnhu4duIHBow6FwIGx14bqtdCI6IiIsIkVtYWlsIEvhur8gdG/DoW4gdHLGsOG7n25nIjoibmd1eWVubmhhbmg4NjNAZ21haWwuY29tIiwiS+G6vyB0b8OhbiB0csaw4bufbmciOiJOZ3V54buFbiBUaOG7iyBOaGFuaCIsIkNo4buvIGvDvSBL4bq/IHRvw6FuIHRyxrDhu59uZyI6IiIsIkVtYWlsIFRo4bunIHF14bu5IjoibGluaC5sZUB0bC1jLmNvbS52biIsIlRo4bunIHF14bu5IjoiTMOqIFRodeG7syBMaW5oIiwiQ2jhu68ga8O9IFRo4bunIHF14bu5IjoiIiwiTmfDoHkgaGnhu4d1IGzhu7FjIjoiMTIvMjIvMjAyNSJ9LHsiVMOqbiBjw7RuZyB0eSB2aeG6v3QgdOG6r3QiOiJFLlYiLCJUw6puIGPDtG5nIHR5IjoiQ8OUTkcgVFkgVE5ISCBFR0cgVkVOVFVSRVMiLCLEkOG7i2EgY2jhu4kiOiJCLjMuMDksIFThuqduZyAzLCBMw7QgQiwgU+G7kSAzNC0zNSBC4bq/biBWw6JuIMSQ4buTbiwgUGjGsOG7nW5nIDEzLCBRdeG6rW4gNCwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFtIiwiTcOjIHPhu5EgdGh14bq/IjoiMDMxNDQ5NDA2MCIsIkVtYWlsIMSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoiYW5oLmxlQG1lZGlhaW5zaWRlci52biIsIsSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoiTMOqIE5nw6JuIEFuaCIsIkNo4buvIGvDvSDEkOG6oWkgZGnhu4duIHBow6FwIGx14bqtdCI6IiIsIkVtYWlsIEvhur8gdG/DoW4gdHLGsOG7n25nIjoibmd1eWVubmhhbmg4NjNAZ21haWwuY29tIiwiS+G6vyB0b8OhbiB0csaw4bufbmciOiJOZ3V54buFbiBUaOG7iyBOaGFuaCIsIkNo4buvIGvDvSBL4bq/IHRvw6FuIHRyxrDhu59uZyI6IiIsIkVtYWlsIFRo4bunIHF14bu5IjoibGluaC5sZUB0bC1jLmNvbS52biIsIlRo4bunIHF14bu5IjoiTMOqIFRodeG7syBMaW5oIiwiQ2jhu68ga8O9IFRo4bunIHF14bu5IjoiIiwiTmfDoHkgaGnhu4d1IGzhu7FjIjoiMTIvMjIvMjAyNSJ9LHsiVMOqbiBjw7RuZyB0eSB2aeG6v3QgdOG6r3QiOiJDLlAiLCJUw6puIGPDtG5nIHR5IjoiQ8OUTkcgVFkgQ+G7lCBQSOG6pk4gxJDhuqZVIFTGryBDSElOSCBQSE9ORyIsIsSQ4buLYSBjaOG7iSI6IkIuMy4wOSwgVOG6p25nIDMsIEzDtCBCLCBT4buRIDM0LTM1IELhur9uIFbDom4gxJDhu5NuLCBQaMaw4budbmcgMTMsIFF14bqtbiA0LCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0iLCJNw6Mgc+G7kSB0aHXhur8iOiIwMzE0MDk3NTA3IiwiRW1haWwgxJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiJhbmgubGVAbWVkaWFpbnNpZGVyLnZuIiwixJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiJMw6ogTmfDom4gQW5oIiwiQ2jhu68ga8O9IMSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoiIiwiRW1haWwgS+G6vyB0b8OhbiB0csaw4bufbmciOiJuZ3V5ZW5uaGFuaDg2M0BnbWFpbC5jb20iLCJL4bq/IHRvw6FuIHRyxrDhu59uZyI6Ik5ndXnhu4VuIFRo4buLIE5oYW5oIiwiQ2jhu68ga8O9IEvhur8gdG/DoW4gdHLGsOG7n25nIjoiIiwiRW1haWwgVGjhu6cgcXXhu7kiOiJsaW5oLmxlQHRsLWMuY29tLnZuIiwiVGjhu6cgcXXhu7kiOiJMw6ogVGh14buzIExpbmgiLCJDaOG7ryBrw70gVGjhu6cgcXXhu7kiOiIiLCJOZ8OgeSBoaeG7h3UgbOG7sWMiOiIxMi8yMi8yMDI1In0seyJUw6puIGPDtG5nIHR5IHZp4bq/dCB04bqvdCI6Ik0uSSIsIlTDqm4gY8O0bmcgdHkiOiJDw5RORyBUWSBUTkhIIE1FRElBIElOU0lERVIiLCLEkOG7i2EgY2jhu4kiOiJCLjMuMDksIFThuqduZyAzLCBMw7QgQiwgU+G7kSAzNC0zNSBC4bq/biBWw6JuIMSQ4buTbiwgUGjGsOG7nW5nIDEzLCBRdeG6rW4gNCwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFtIiwiTcOjIHPhu5EgdGh14bq/IjoiMDMxNTM4MDQyOSIsIkVtYWlsIMSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoiYW5oLmxlQG1lZGlhaW5zaWRlci52biIsIsSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoiTMOqIE5nw6JuIEFuaCIsIkNo4buvIGvDvSDEkOG6oWkgZGnhu4duIHBow6FwIGx14bqtdCI6IiIsIkVtYWlsIEvhur8gdG/DoW4gdHLGsOG7n25nIjoibmd1eWVubmhhbmg4NjNAZ21haWwuY29tIiwiS+G6vyB0b8OhbiB0csaw4bufbmciOiJOZ3V54buFbiBUaOG7iyBOaGFuaCIsIkNo4buvIGvDvSBL4bq/IHRvw6FuIHRyxrDhu59uZyI6IiIsIkVtYWlsIFRo4bunIHF14bu5IjoibGluaC5sZUB0bC1jLmNvbS52biIsIlRo4bunIHF14bu5IjoiTMOqIFRodeG7syBMaW5oIiwiQ2jhu68ga8O9IFRo4bunIHF14bu5IjoiIiwiTmfDoHkgaGnhu4d1IGzhu7FjIjoiMTIvMjIvMjAyNSJ9LHsiVMOqbiBjw7RuZyB0eSB2aeG6v3QgdOG6r3QiOiJUTENHIiwiVMOqbiBjw7RuZyB0eSI6IkPDlE5HIFRZIEPhu5QgUEjhuqZOIMSQ4bqmVSBUxq8gVExDIEdST1VQIiwixJDhu4thIGNo4buJIjoiQi4zLjA5LCBU4bqnbmcgMywgTMO0IEIsIFPhu5EgMzQtMzUgQuG6v24gVsOibiDEkOG7k24sIFBoxrDhu51uZyAxMywgUXXhuq1uIDQsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbSIsIk3DoyBz4buRIHRodeG6vyI6IjAzMTUzMDc2NzYiLCJFbWFpbCDEkOG6oWkgZGnhu4duIHBow6FwIGx14bqtdCI6ImFuaC5sZUBtZWRpYWluc2lkZXIudm4iLCLEkOG6oWkgZGnhu4duIHBow6FwIGx14bqtdCI6IkzDqiBOZ8OibiBBbmgiLCJDaOG7ryBrw70gxJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiIiLCJFbWFpbCBL4bq/IHRvw6FuIHRyxrDhu59uZyI6Im5ndXllbm5oYW5oODYzQGdtYWlsLmNvbSIsIkvhur8gdG/DoW4gdHLGsOG7n25nIjoiTmd1eeG7hW4gVGjhu4sgTmhhbmgiLCJDaOG7ryBrw70gS+G6vyB0b8OhbiB0csaw4bufbmciOiIiLCJFbWFpbCBUaOG7pyBxdeG7uSI6ImxpbmgubGVAdGwtYy5jb20udm4iLCJUaOG7pyBxdeG7uSI6IkzDqiBUaHXhu7MgTGluaCIsIkNo4buvIGvDvSBUaOG7pyBxdeG7uSI6IiIsIk5nw6B5IGhp4buHdSBs4buxYyI6IjEyLzIyLzIwMjUifSx7IlTDqm4gY8O0bmcgdHkgdmnhur90IHThuq90IjoiVy5TIiwiVMOqbiBjw7RuZyB0eSI6IkPDlE5HIFRZIEPhu5QgUEjhuqZOIFdPUktTTUFSVCIsIsSQ4buLYSBjaOG7iSI6IkIuMy4wOSwgVOG6p25nIDMsIEzDtCBCLCBT4buRIDM0LTM1IELhur9uIFbDom4gxJDhu5NuLCBQaMaw4budbmcgMTMsIFF14bqtbiA0LCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0iLCJNw6Mgc+G7kSB0aHXhur8iOiIwMzE1MjQwMjA2IiwiRW1haWwgxJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiJhbmgubGVAbWVkaWFpbnNpZGVyLnZuIiwixJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiJMw6ogTmfDom4gQW5oIiwiQ2jhu68ga8O9IMSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoiIiwiRW1haWwgS+G6vyB0b8OhbiB0csaw4bufbmciOiJuZ3V5ZW5uaGFuaDg2M0BnbWFpbC5jb20iLCJL4bq/IHRvw6FuIHRyxrDhu59uZyI6Ik5ndXnhu4VuIFRo4buLIE5oYW5oIiwiQ2jhu68ga8O9IEvhur8gdG/DoW4gdHLGsOG7n25nIjoiIiwiRW1haWwgVGjhu6cgcXXhu7kiOiJsaW5oLmxlQHRsLWMuY29tLnZuIiwiVGjhu6cgcXXhu7kiOiJMw6ogVGh14buzIExpbmgiLCJDaOG7ryBrw70gVGjhu6cgcXXhu7kiOiIiLCJOZ8OgeSBoaeG7h3UgbOG7sWMiOiIxMi8yMi8yMDI1In0seyJUw6puIGPDtG5nIHR5IHZp4bq/dCB04bqvdCI6IklOUyIsIlTDqm4gY8O0bmcgdHkiOiJDw5RORyBUWSBD4buUIFBI4bqmTiBJTlNJREVSUyIsIsSQ4buLYSBjaOG7iSI6IkIuMy4wOSwgVOG6p25nIDMsIEzDtCBCLCBT4buRIDM0LTM1IELhur9uIFbDom4gxJDhu5NuLCBQaMaw4budbmcgWMOzbSBDaGnhur91LCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0iLCJNw6Mgc+G7kSB0aHXhur8iOiIwMzEzNTIyODA4IiwiRW1haWwgxJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiJsaW5oLmxlQHRsLWMuY29tLnZuIiwixJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiJMw6ogVGh14buzIExpbmgiLCJDaOG7ryBrw70gxJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiIiLCJFbWFpbCBL4bq/IHRvw6FuIHRyxrDhu59uZyI6Im5ndXllbm5oYW5oODYzQGdtYWlsLmNvbSIsIkvhur8gdG/DoW4gdHLGsOG7n25nIjoiTmd1eeG7hW4gVGjhu4sgTmhhbmgiLCJDaOG7ryBrw70gS+G6vyB0b8OhbiB0csaw4bufbmciOiIiLCJFbWFpbCBUaOG7pyBxdeG7uSI6ImxpbmgubGVAdGwtYy5jb20udm4iLCJUaOG7pyBxdeG7uSI6IkzDqiBUaHXhu7MgTGluaCIsIkNo4buvIGvDvSBUaOG7pyBxdeG7uSI6IiIsIk5nw6B5IGhp4buHdSBs4buxYyI6IjEyLzIyLzIwMjUifSx7IlTDqm4gY8O0bmcgdHkgdmnhur90IHThuq90IjoiRVZfS1RUXzIwNU5UUCIsIlTDqm4gY8O0bmcgdHkiOiJDw5RORyBUWSBUTkhIIEVHRyBWRU5UVVJFUyIsIsSQ4buLYSBjaOG7iSI6IkIuMy4wOSwgVOG6p25nIDMsIEzDtCBCLCBT4buRIDM0LTM1IELhur9uIFbDom4gxJDhu5NuLCBQaMaw4budbmcgMTMsIFF14bqtbiA0LCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0iLCJNw6Mgc+G7kSB0aHXhur8iOiIwMzE0NDk0MDYwIiwiRW1haWwgxJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiJhbmgubGVAbWVkaWFpbnNpZGVyLnZuIiwixJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiJMw6ogTmfDom4gQW5oIiwiQ2jhu68ga8O9IMSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoiIiwiRW1haWwgS+G6vyB0b8OhbiB0csaw4bufbmciOiJuZ3V5ZW5uaGFuaDg2M0BnbWFpbC5jb20iLCJL4bq/IHRvw6FuIHRyxrDhu59uZyI6Ik5ndXnhu4VuIFRo4buLIE5oYW5oIiwiQ2jhu68ga8O9IEvhur8gdG/DoW4gdHLGsOG7n25nIjoiIiwiRW1haWwgVGjhu6cgcXXhu7kiOiJsaW5oLmxlQHRsLWMuY29tLnZuIiwiVGjhu6cgcXXhu7kiOiJMw6ogVGh14buzIExpbmgiLCJDaOG7ryBrw70gVGjhu6cgcXXhu7kiOiIiLCJOZ8OgeSBoaeG7h3UgbOG7sWMiOiIxMi8yMi8yMDI1In0seyJUw6puIGPDtG5nIHR5IHZp4bq/dCB04bqvdCI6IlJJT1QiLCJUw6puIGPDtG5nIHR5IjoiQ8OUTkcgVFkgVFLDgUNIIE5ISeG7hk0gSOG7rlUgSOG6oE4gROG7ikNIIFbhu6QgUklPVCBHQU1FUyIsIsSQ4buLYSBjaOG7iSI6IlThuqduZyAxMSwgVMOyYSBuaMOgIE1pc3Mgw6FvIETDoGksIHPhu5EgMjEgxJDGsOG7nW5nIE5ndXnhu4VuLCBQaMaw4budbmcgQuG6v24gTmdow6kgLCBRdeG6rW4gMSAsIFRQIEjhu5MgQ2jDrSBNaW5oIiwiTcOjIHPhu5EgdGh14bq/IjoiMDMxNDQxOTA3MCIsIkVtYWlsIMSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoibGluaC5sZUB0bC1jLmNvbS52biIsIsSQ4bqhaSBkaeG7h24gcGjDoXAgbHXhuq10IjoiUGjhuqFtIEtpw6puIFPGoW4iLCJDaOG7ryBrw70gxJDhuqFpIGRp4buHbiBwaMOhcCBsdeG6rXQiOiIiLCJFbWFpbCBL4bq/IHRvw6FuIHRyxrDhu59uZyI6Im5ndXllbm5oYW5oODYzQGdtYWlsLmNvbSIsIkvhur8gdG/DoW4gdHLGsOG7n25nIjoiTMOqIFRodeG7syBMaW5oIiwiQ2jhu68ga8O9IEvhur8gdG/DoW4gdHLGsOG7n25nIjoiIiwiRW1haWwgVGjhu6cgcXXhu7kiOiJsaW5oLmxlQHRsLWMuY29tLnZuIiwiVGjhu6cgcXXhu7kiOiJMw6ogVGh14buzIExpbmgiLCJDaOG7ryBrw70gVGjhu6cgcXXhu7kiOiIiLCJOZ8OgeSBoaeG7h3UgbOG7sWMiOiIxMi8yMi8yMDI1In1dfQ==");;

        // IMPORTANT: Replace this with your actual Google Apps Script Web App URL
        // Instructions:
        // 1. Go to script.google.com and create a new project.
        // 2. Copy the Apps Script code provided below into Code.gs.
        // 3. Save the project.
        // 4. Click "Deploy" -> "New deployment".
        // 5. Select "Web app" as the type.
        // 6. Set "Execute as" to "Me" (your Google account).
        // 7. Set "Who has access" to "Anyone".
        // 8. Click "Deploy".
        // 9. Copy the "Web app URL" and paste it here.
        // 10. Ensure your Google account has permissions to send emails via Gmail (usually default).
        // Use proxy URL to avoid CORS issues
        // For direct URL, use: 'https://script.google.com/macros/s/AKfycbw05Cr7-Mm2TtgQgxVaVoobvdSUHtX2Y8vjTi0Fd-_UmL0ojojyLDOwXwyaMWDwGW06Iw/exec'
        const GOOGLE_APPS_SCRIPT_WEB_APP_URL = '/api/voucher';

        // Initialize email mappings based on provided exact emails and company data
        const employeeEmailMap = {
            "Lê Ngân Anh": "anh.le@mediainsider.vn",
            "Nguyễn Văn Chinh": "chinh.nguyen@mediainsider.vn",
            "Lê Thùy Linh": "linh.le@tl-c.com.vn",
            "Nguyễn Lực": "hieuluc.nguyen@gmail.com"
        };

        const approverEmailMap = {
            "Lê Ngân Anh": "anh.le@mediainsider.vn",
            "Nguyễn Văn Chinh": "chinh.nguyen@mediainsider.vn",
            "Lê Thùy Linh": "linh.le@tl-c.com.vn",
            "Nguyễn Lực": "hieuluc.nguyen@gmail.com"
        };

        // Augment employeeEmailMap and approverEmailMap with emails from companies_data
        data.companies_data.forEach(company => {
            if (company["Đại diện pháp luật"] && company["Email Đại diện pháp luật"]) {
                employeeEmailMap[company["Đại diện pháp luật"]] = company["Email Đại diện pháp luật"];
                approverEmailMap[company["Đại diện pháp luật"]] = company["Email Đại diện pháp luật"];
            }
            if (company["Kế toán trưởng"] && company["Email Kế toán trưởng"]) {
                employeeEmailMap[company["Kế toán trưởng"]] = company["Email Kế toán trưởng"];
                approverEmailMap[company["Kế toán trưởng"]] = company["Email Kế toán trưởng"];
            }
            if (company["Thủ quỹ"] && company["Email Thủ quỹ"]) {
                employeeEmailMap[company["Thủ quỹ"]] = company["Email Thủ quỹ"];
                // Thủ quỹ might not always be an approver, but including for completeness if they are in approver_names
                approverEmailMap[company["Thủ quỹ"]] = company["Email Thủ quỹ"];
            }
        });

        // Add employee departments (assuming this data exists or can be derived)
        // For demonstration, creating a simple map. In a real app, this would come from backend.
        data.employee_departments = {};
        data.employee_names.forEach(name => {
            if (name === "Lê Ngân Anh") data.employee_departments[name] = "Ban Giám đốc";
            else if (name === "Nguyễn Văn Chinh") data.employee_departments[name] = "Phòng Kinh doanh";
            else if (name === "Lê Thùy Linh") data.employee_departments[name] = "Phòng Kế toán";
            else if (name === "Nguyễn Lực") data.employee_departments[name] = "Phòng Kỹ thuật";
            else if (name === "Nguyễn Thị Nhanh") data.employee_departments[name] = "Phòng Kế toán";
            else data.employee_departments[name] = "Phòng ban khác";
        });


        let expenseItems = [];
        let approvalHistory = [];
        let autoSaveTimeout = null;
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const AUTO_SAVE_DELAY = 2000; // 2 seconds

        // Toast Notification Functions
        function showToast(message, type = 'info', title = '') {
            const toastContainer = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            const icons = {
                success: '✅',
                error: '❌',
                info: 'ℹ️',
                warning: '⚠️'
            };
            
            toast.innerHTML = `
                <span class="toast-icon">${icons[type] || icons.info}</span>
                <div class="toast-content">
                    ${title ? `<div class="toast-title">${title}</div>` : ''}
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
            `;
            
            toastContainer.appendChild(toast);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                toast.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }, 5000);
        }

        // Confirmation Dialog Functions
        function showConfirmation(message, title = 'Xác nhận') {
            return new Promise((resolve) => {
                const overlay = document.getElementById('confirmation-overlay');
                const titleEl = document.getElementById('confirmation-title');
                const messageEl = document.getElementById('confirmation-message');
                const confirmBtn = document.getElementById('confirmation-confirm');
                const cancelBtn = document.getElementById('confirmation-cancel');
                
                titleEl.textContent = title;
                messageEl.textContent = message;
                overlay.classList.add('show');
                
                const handleConfirm = () => {
                    overlay.classList.remove('show');
                    confirmBtn.removeEventListener('click', handleConfirm);
                    cancelBtn.removeEventListener('click', handleCancel);
                    resolve(true);
                };
                
                const handleCancel = () => {
                    overlay.classList.remove('show');
                    confirmBtn.removeEventListener('click', handleConfirm);
                    cancelBtn.removeEventListener('click', handleCancel);
                    resolve(false);
                };
                
                confirmBtn.addEventListener('click', handleConfirm);
                cancelBtn.addEventListener('click', handleCancel);
            });
        }

        // Validation Functions
        function validateField(fieldId, value, fieldName) {
            const field = document.getElementById(fieldId);
            const errorEl = field.parentElement.querySelector('.error-message');
            
            if (!field) return true;
            
            let isValid = true;
            let errorMessage = '';
            
            // Required field validation
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = `${fieldName} là bắt buộc`;
            }
            
            // Specific validations
            if (value) {
                if (fieldId === 'payee-name' && value.length < 2) {
                    isValid = false;
                    errorMessage = 'Tên người nộp/nhận phải có ít nhất 2 ký tự';
                }
                if (fieldId === 'reason' && value.length < 10) {
                    isValid = false;
                    errorMessage = 'Lý do phải có ít nhất 10 ký tự';
                }
            }
            
            // Update UI
            if (isValid) {
                field.classList.remove('invalid');
                field.classList.add('valid');
                if (errorEl) {
                    errorEl.classList.remove('show');
                }
            } else {
                field.classList.remove('valid');
                field.classList.add('invalid');
                if (errorEl) {
                    errorEl.textContent = errorMessage;
                    errorEl.classList.add('show');
                } else {
                    const newErrorEl = document.createElement('div');
                    newErrorEl.className = 'error-message show';
                    newErrorEl.textContent = errorMessage;
                    field.parentElement.appendChild(newErrorEl);
                }
            }
            
            return isValid;
        }

        function validateAllFields() {
            const fields = [
                { id: 'company', name: 'Công ty' },
                { id: 'voucher-type', name: 'Loại phiếu' },
                { id: 'employee', name: 'Người đề nghị' },
                { id: 'payee-name', name: 'Người nộp/nhận' },
                { id: 'currency', name: 'Loại tiền' },
                { id: 'reason', name: 'Lý do' }
            ];
            
            let isValid = true;
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (!validateField(field.id, element ? element.value : '', field.name)) {
                    isValid = false;
                }
            });
            
            // Validate expense items
            if (expenseItems.length === 0) {
                showToast('Vui lòng nhập ít nhất một dòng chi tiết', 'error');
                isValid = false;
            } else {
                const invalidItems = expenseItems.filter(item => !item.content || item.amount === 0);
                if (invalidItems.length > 0) {
                    showToast('Vui lòng điền đầy đủ Nội dung và Số tiền cho tất cả các dòng', 'error');
                    isValid = false;
                }
            }
            
            return isValid;
        }

        // Auto-save Functions
        function saveToLocalStorage() {
            try {
                const formData = {
                    company: document.getElementById('company').value,
                    voucherType: document.getElementById('voucher-type').value,
                    employee: document.getElementById('employee').value,
                    payeeName: document.getElementById('payee-name').value,
                    currency: document.getElementById('currency').value,
                    reason: document.getElementById('reason').value,
                    voucherDate: document.getElementById('voucher-date').value,
                    voucherNumber: document.getElementById('voucher-number').value,
                    approver: document.getElementById('approver').value,
                    expenseItems: expenseItems.map(item => ({
                        content: item.content,
                        amount: item.amount,
                        attachments: item.attachments.map(f => ({ name: f.name, size: f.size }))
                    })),
                    approvalHistory: approvalHistory,
                    lastSaved: new Date().toISOString()
                };
                
                localStorage.setItem('voucher_draft', JSON.stringify(formData));
                showAutoSaveIndicator('saved');
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        }

        function loadFromLocalStorage() {
            try {
                const saved = localStorage.getItem('voucher_draft');
                if (saved) {
                    const formData = JSON.parse(saved);
                    
                    // Restore form fields
                    if (formData.company) document.getElementById('company').value = formData.company;
                    if (formData.voucherType) document.getElementById('voucher-type').value = formData.voucherType;
                    if (formData.employee) {
                        document.getElementById('employee').value = formData.employee;
                        updateEmployeeDepartment();
                    }
                    if (formData.payeeName) document.getElementById('payee-name').value = formData.payeeName;
                    if (formData.currency) document.getElementById('currency').value = formData.currency;
                    if (formData.reason) document.getElementById('reason').value = formData.reason;
                    if (formData.voucherDate) document.getElementById('voucher-date').value = formData.voucherDate;
                    if (formData.voucherNumber) document.getElementById('voucher-number').value = formData.voucherNumber;
                    if (formData.approver) document.getElementById('approver').value = formData.approver;
                    
                    // Restore expense items (without file objects)
                    if (formData.expenseItems && formData.expenseItems.length > 0) {
                        expenseItems = formData.expenseItems.map(item => ({
                            content: item.content,
                            amount: item.amount,
                            attachments: [] // Files can't be restored from localStorage
                        }));
                        renderExpenseTable();
                    }
                    
                    if (formData.approvalHistory) {
                        approvalHistory = formData.approvalHistory;
                        renderApprovalHistory();
                    }
                    
                    updateCompanyDetails();
                    updateGrandTotal();
                    
                    showToast('Đã khôi phục dữ liệu đã lưu', 'info', 'Khôi phục');
                }
            } catch (error) {
                console.error('Error loading from localStorage:', error);
            }
        }

        function showAutoSaveIndicator(status) {
            const indicator = document.getElementById('auto-save-indicator');
            indicator.className = `auto-save-indicator ${status} show`;
            
            if (status === 'saving') {
                indicator.textContent = 'Đang lưu...';
            } else if (status === 'saved') {
                indicator.textContent = 'Đã lưu tự động';
                setTimeout(() => {
                    indicator.classList.remove('show');
                }, 2000);
            }
        }

        function debounceAutoSave() {
            if (autoSaveTimeout) {
                clearTimeout(autoSaveTimeout);
            }
            
            showAutoSaveIndicator('saving');
            autoSaveTimeout = setTimeout(() => {
                saveToLocalStorage();
            }, AUTO_SAVE_DELAY);
        }

        // File Validation
        function validateFile(file) {
            if (file.size > MAX_FILE_SIZE) {
                showToast(`File "${file.name}" quá lớn. Kích thước tối đa là 10MB`, 'error');
                return false;
            }
            return true;
        }

        document.addEventListener('DOMContentLoaded', function() {
            initializeForm();
            setCurrentDate();
            generateVoucherNumber();
            renderExpenseTable();
            
            // Load saved data
            loadFromLocalStorage();

            // Add event listeners for buttons
            document.getElementById('export-pdf-btn').addEventListener('click', exportToPDF);
            document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
            document.getElementById('import-excel-btn').addEventListener('click', importFromExcelForm);
            document.getElementById('sync-sheets-btn').addEventListener('click', syncWithGoogleSheets);
            document.getElementById('save-btn').addEventListener('click', saveVoucher);
            document.getElementById('send-approval-btn').addEventListener('click', sendForApproval);
            
            document.getElementById('add-row-btn').addEventListener('click', addExpenseRow);
            document.getElementById('copy-excel-btn').addEventListener('click', copyFromExcelToTable);
            document.getElementById('import-table-excel-btn').addEventListener('click', importExcelToTable);

            // Add real-time validation listeners
            const fieldsToValidate = ['company', 'voucher-type', 'employee', 'payee-name', 'currency', 'reason'];
            fieldsToValidate.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('blur', function() {
                        const fieldNames = {
                            'company': 'Công ty',
                            'voucher-type': 'Loại phiếu',
                            'employee': 'Người đề nghị',
                            'payee-name': 'Người nộp/nhận',
                            'currency': 'Loại tiền',
                            'reason': 'Lý do'
                        };
                        validateField(fieldId, this.value, fieldNames[fieldId]);
                        debounceAutoSave();
                    });
                    
                    field.addEventListener('input', function() {
                        // Remove invalid class on input
                        if (this.classList.contains('invalid')) {
                            this.classList.remove('invalid');
                            const errorEl = this.parentElement.querySelector('.error-message');
                            if (errorEl) errorEl.classList.remove('show');
                        }
                        debounceAutoSave();
                    });
                }
            });

            renderApprovalHistory();
        });
        
        function initializeForm() {
            document.getElementById('form-title').textContent = data.form_title;
            
            const companySelect = document.getElementById('company');
            data.company_names.forEach(company => {
                const option = document.createElement('option');
                option.value = company;
                option.textContent = company;
                companySelect.appendChild(option);
            });
            
            const employeeSelect = document.getElementById('employee');
            const payeeDropdown = document.getElementById('payee-dropdown');
            data.employee_names.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee;
                option.textContent = employee;
                employeeSelect.appendChild(option);

                const payeeOption = option.cloneNode(true);
                payeeDropdown.appendChild(payeeOption);
            });
            
            const voucherTypeSelect = document.getElementById('voucher-type');
            data.voucher_types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                voucherTypeSelect.appendChild(option);
            });
            
            const currencySelect = document.getElementById('currency');
            data.currency_options.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                currencySelect.appendChild(option);
            });
            
            const approverSelect = document.getElementById('approver');
            data.approver_names.forEach(approver => {
                const option = document.createElement('option');
                option.value = approver;
                option.textContent = approver;
                approverSelect.appendChild(option);
            });
        }
        
        function updateCompanyDetails() {
            const companySelect = document.getElementById('company');
            const companyDetails = document.getElementById('company-details');
            const companyAddress = document.getElementById('company-address');
            
            const selectedCompany = companySelect.value;
            
            if (selectedCompany) {
                const companyData = data.companies_data.find(c => c["Tên công ty"] === selectedCompany);
                if (companyData) {
                    companyAddress.textContent = `Địa chỉ: ${companyData["Địa chỉ"]}`;
                    companyDetails.classList.add('show');
                }
            } else {
                companyDetails.classList.remove('show');
            }
        }

        function updateEmployeeDepartment() {
            const employeeSelect = document.getElementById('employee');
            const departmentInput = document.getElementById('department');
            const selectedEmployee = employeeSelect.value;

            if (selectedEmployee && data.employee_departments) {
                departmentInput.value = data.employee_departments[selectedEmployee] || '';
            } else {
                departmentInput.value = '';
            }
        }
        
        function setCurrentDate() {
            const today = new Date();
            const formattedDate = today.toISOString().substr(0, 10);
            document.getElementById('voucher-date').value = formattedDate;
        }
        
        function generateVoucherNumber() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            
            const voucherNumber = `TL-${year}${month}-${randomNum}`;
            document.getElementById('voucher-number').value = voucherNumber;
        }
        
        function updateAmountInWords() {
            const amountInput = document.getElementById('amount');
            const amount = parseCurrency(amountInput.value) || 0;
            const amountInWordsInput = document.getElementById('amount-in-words');
            
            if (amount > 0) {
                amountInWordsInput.value = convertNumberToWords(amount) + " đồng";
            } else {
                amountInWordsInput.value = "";
            }
        }
        
        function convertNumberToWords(num) {
            const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
            const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
            const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
            const scales = ['', 'nghìn', 'triệu', 'tỷ'];

            function convertLessThanOneThousand(n) {
                let s = '';
                if (n >= 100) {
                    s += units[Math.floor(n / 100)] + ' trăm ';
                    n %= 100;
                }
                if (n >= 20) {
                    s += tens[Math.floor(n / 10)] + ' ';
                    n %= 10;
                }
                if (n >= 10) {
                    s += teens[n - 10] + ' ';
                    n = 0;
                }
                if (n > 0) {
                    s += units[n] + ' ';
                }
                return s.trim();
            }

            if (num === 0) return 'Không';

            let result = '';
            let i = 0;
            let tempNum = num;

            while (tempNum > 0) {
                const chunk = tempNum % 1000;
                if (chunk !== 0) {
                    let chunkWords = convertLessThanOneThousand(chunk);
                    result = chunkWords + ' ' + scales[i] + ' ' + result;
                }
                tempNum = Math.floor(tempNum / 1000);
                i++;
            }
            return result.trim().replace(/\s+/g, ' ').replace(/mươi một/g, 'mươi mốt').replace(/mươi năm/g, 'mươi lăm').replace(/một trăm/g, 'một trăm').replace(/linh một/g, 'lẻ một').replace(/linh năm/g, 'lẻ năm');
        }
        
        function exportToPDF() {
            const element = document.getElementById('voucher-form');
            const opt = {
                margin: 10,
                filename: 'phieu_chi_thu.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            html2pdf().set(opt).from(element).save();
            showToast('Đã xuất PDF thành công!', 'success', 'Thành công');
        }
        
        function exportToExcel() {
            try {
                // Validate form before export
                if (!validateAllFields()) {
                    showToast('Vui lòng điền đầy đủ thông tin trước khi xuất Excel', 'error', 'Lỗi validation');
                    return;
                }

                // Create workbook
                const wb = XLSX.utils.book_new();
                
                // Sheet 1: Form Data
                const formData = [
                    ['PHIẾU THU/CHI - THÔNG TIN CHÍNH'],
                    [],
                    ['Công ty', document.getElementById('company').value],
                    ['Loại phiếu', document.getElementById('voucher-type').value],
                    ['Số phiếu', document.getElementById('voucher-number').value],
                    ['Ngày lập phiếu', document.getElementById('voucher-date').value],
                    ['Người đề nghị', document.getElementById('employee').value],
                    ['Bộ phận', document.getElementById('department').value],
                    ['Người nộp/nhận', document.getElementById('payee-name').value],
                    ['Loại tiền', document.getElementById('currency').value],
                    ['Tổng số tiền', document.getElementById('amount').value],
                    ['Số tiền bằng chữ', document.getElementById('amount-in-words').value],
                    ['Lý do', document.getElementById('reason').value],
                    ['Người phê duyệt', document.getElementById('approver').value],
                    ['Trạng thái', document.getElementById('approval-status-display').textContent]
                ];
                
                const ws1 = XLSX.utils.aoa_to_sheet(formData);
                XLSX.utils.book_append_sheet(wb, ws1, 'Thông tin phiếu');
                
                // Sheet 2: Expense Items
                const expenseData = [
                    ['STT', 'Nội dung', 'Số tiền', 'Số file đính kèm']
                ];
                
                expenseItems.forEach((item, index) => {
                    expenseData.push([
                        index + 1,
                        item.content || '',
                        item.amount || 0,
                        item.attachments ? item.attachments.length : 0
                    ]);
                });
                
                // Add total row
                const grandTotal = expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0);
                expenseData.push(['', 'TỔNG CỘNG', grandTotal, '']);
                
                const ws2 = XLSX.utils.aoa_to_sheet(expenseData);
                
                // Set column widths
                ws2['!cols'] = [
                    { wch: 5 },   // STT
                    { wch: 40 },  // Nội dung
                    { wch: 15 },  // Số tiền
                    { wch: 15 }   // Số file đính kèm
                ];
                
                XLSX.utils.book_append_sheet(wb, ws2, 'Chi tiết chi phí');
                
                // Sheet 3: Approval History
                const historyData = [
                    ['Thời gian', 'Hành động', 'Người thực hiện', 'Gửi đến']
                ];
                
                if (approvalHistory.length > 0) {
                    approvalHistory.forEach(entry => {
                        historyData.push([
                            entry.timestamp || '',
                            entry.action || '',
                            entry.by || '',
                            entry.to || ''
                        ]);
                    });
                } else {
                    historyData.push(['Chưa có lịch sử phê duyệt']);
                }
                
                const ws3 = XLSX.utils.aoa_to_sheet(historyData);
                XLSX.utils.book_append_sheet(wb, ws3, 'Lịch sử phê duyệt');
                
                // Generate filename with date
                const today = new Date();
                const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
                const voucherNumber = document.getElementById('voucher-number').value.replace(/[^a-zA-Z0-9]/g, '_');
                const filename = `Phieu_Thu_Chi_${voucherNumber}_${dateStr}.xlsx`;
                
                // Export file
                XLSX.writeFile(wb, filename);
                showToast('Đã xuất Excel thành công!', 'success', 'Thành công');
                
            } catch (error) {
                console.error('Error exporting to Excel:', error);
                showToast('Có lỗi xảy ra khi xuất Excel: ' + error.message, 'error', 'Lỗi');
            }
        }
        
        function importFromExcelForm() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx, .xls';
            
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    
                    if (jsonData.length > 0) {
                        const row = jsonData[0];
                        if (row.company) document.getElementById('company').value = row.company;
                        if (row.employee) document.getElementById('employee').value = row.employee;
                        if (row.payeeName) document.getElementById('payee-name').value = row.payeeName;
                        if (row.reason) document.getElementById('reason').value = row.reason;
                        if (row.approver) document.getElementById('approver').value = row.approver;
                        
                        updateCompanyDetails();
                        updateEmployeeDepartment();
                        updateGrandTotal();
                        debounceAutoSave();
                        showToast('Đã nhập dữ liệu từ Excel vào form chính thành công!', 'success', 'Thành công');
                    }
                };
                reader.readAsArrayBuffer(file);
            });
            
            input.click();
        }
        
        // Google Sheets Configuration
        const GOOGLE_SHEETS_CONFIG = {
            spreadsheetId: '', // User needs to set this
            sheetName: 'Phiếu Thu Chi',
            apiKey: '' // Optional: for public sheets
        };

        async function syncWithGoogleSheets() {
            try {
                // Validate form before sync
                if (!validateAllFields()) {
                    showToast('Vui lòng điền đầy đủ thông tin trước khi đồng bộ', 'error', 'Lỗi validation');
                    return;
                }

                // Check if spreadsheet ID is configured
                if (!GOOGLE_SHEETS_CONFIG.spreadsheetId) {
                    const spreadsheetId = prompt('Vui lòng nhập Google Sheets ID (có thể lấy từ URL của sheet):');
                    if (!spreadsheetId) {
                        showToast('Cần Google Sheets ID để đồng bộ', 'error', 'Lỗi cấu hình');
                        return;
                    }
                    GOOGLE_SHEETS_CONFIG.spreadsheetId = spreadsheetId;
                }

                showToast('Đang đồng bộ với Google Sheets...', 'info', 'Đang xử lý');

                // Prepare data
                const voucherData = {
                    timestamp: new Date().toISOString(),
                    voucherNumber: document.getElementById('voucher-number').value,
                    voucherType: document.getElementById('voucher-type').value,
                    voucherDate: document.getElementById('voucher-date').value,
                    company: document.getElementById('company').value,
                    employee: document.getElementById('employee').value,
                    department: document.getElementById('department').value,
                    payeeName: document.getElementById('payee-name').value,
                    currency: document.getElementById('currency').value,
                    totalAmount: document.getElementById('amount').value,
                    amountInWords: document.getElementById('amount-in-words').value,
                    reason: document.getElementById('reason').value,
                    approver: document.getElementById('approver').value,
                    status: document.getElementById('approval-status-display').textContent,
                    expenseItems: expenseItems.map((item, index) => ({
                        stt: index + 1,
                        content: item.content,
                        amount: item.amount,
                        attachments: item.attachments.length
                    })),
                    approvalHistory: approvalHistory
                };

                // Use Google Apps Script to write to Sheets
                if (GOOGLE_APPS_SCRIPT_WEB_APP_URL && GOOGLE_APPS_SCRIPT_WEB_APP_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
                    const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            action: 'syncToSheets',
                            spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
                            sheetName: GOOGLE_SHEETS_CONFIG.sheetName,
                            data: voucherData
                        }),
                    });

                    showToast('Đã đồng bộ với Google Sheets thành công!', 'success', 'Thành công');
                } else {
                    // Fallback: Export to Excel and provide instructions
                    showToast('Vui lòng cấu hình Google Apps Script URL. Đang xuất Excel để bạn có thể import thủ công.', 'warning', 'Cảnh báo');
                    exportToExcel();
                    showToast('Bạn có thể import file Excel vừa xuất vào Google Sheets', 'info', 'Hướng dẫn');
                }

            } catch (error) {
                console.error('Error syncing with Google Sheets:', error);
                showToast('Có lỗi xảy ra khi đồng bộ với Google Sheets: ' + error.message, 'error', 'Lỗi');
            }
        }
        
        function saveVoucher() {
            if (!validateAllFields()) {
                showToast('Vui lòng điền đầy đủ thông tin bắt buộc và kiểm tra lại các trường có lỗi', 'error', 'Lỗi validation');
                // Scroll to first error
                const firstError = document.querySelector('.invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
                return;
            }
            
            // Save to localStorage
            saveToLocalStorage();
            showToast('Phiếu đã được lưu thành công!', 'success', 'Thành công');
        }
        
        async function sendForApproval() {
            // Validate approver field specifically
            const approverField = document.getElementById('approver');
            if (!approverField.value) {
                validateField('approver', '', 'Người phê duyệt');
            }
            
            // Validate all fields including approver
            const requiredFields = ['company', 'voucher-type', 'employee', 'payee-name', 'currency', 'reason', 'approver'];
            let isValid = true;
            
            requiredFields.forEach(field => {
                const element = document.getElementById(field);
                const fieldNames = {
                    'company': 'Công ty',
                    'voucher-type': 'Loại phiếu',
                    'employee': 'Người đề nghị',
                    'payee-name': 'Người nộp/nhận',
                    'currency': 'Loại tiền',
                    'reason': 'Lý do',
                    'approver': 'Người phê duyệt'
                };
                if (!validateField(field, element ? element.value : '', fieldNames[field])) {
                    isValid = false;
                }
            });

            if (expenseItems.length === 0 || expenseItems.some(item => !item.content || item.amount === 0)) {
                showToast('Vui lòng nhập ít nhất một dòng chi tiết và điền đầy đủ Nội dung, Số tiền', 'error');
                isValid = false;
            }
            
            if (!isValid) {
                showToast('Vui lòng điền đầy đủ thông tin bắt buộc và kiểm tra lại các trường có lỗi', 'error', 'Lỗi validation');
                // Scroll to first error
                const firstError = document.querySelector('.invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
                return;
            }

            const loadingIndicator = document.getElementById('loading-indicator');
            loadingIndicator.classList.add('show');
            document.getElementById('send-approval-btn').disabled = true;

            const voucherNumber = document.getElementById('voucher-number').value;
            const voucherType = document.getElementById('voucher-type').value;
            const companyName = document.getElementById('company').value;
            const requestorName = document.getElementById('employee').value;
            const payeeName = document.getElementById('payee-name').value;
            const totalAmount = document.getElementById('amount').value;
            const amountInWords = document.getElementById('amount-in-words').value;
            const reason = document.getElementById('reason').value;
            const voucherDate = document.getElementById('voucher-date').value;
            const department = document.getElementById('department').value;

            const selectedApproverName = document.getElementById('approver').value;
            const selectedCompanyData = data.companies_data.find(c => c["Tên công ty"] === companyName);

            const approverEmail = approverEmailMap[selectedApproverName];
            const directorEmail = selectedCompanyData ? selectedCompanyData["Email Đại diện pháp luật"] : '';
            const chiefAccountantEmail = selectedCompanyData ? selectedCompanyData["Email Kế toán trưởng"] : '';
            const requestorEmail = employeeEmailMap[requestorName];

            const recipients = [approverEmail, directorEmail, chiefAccountantEmail].filter(Boolean);
            const ccRecipients = [requestorEmail].filter(Boolean);

            if (recipients.length === 0) {
                showToast('Không tìm thấy địa chỉ email người nhận. Vui lòng kiểm tra lại thông tin công ty và người phê duyệt', 'error', 'Lỗi email');
                loadingIndicator.classList.remove('show');
                document.getElementById('send-approval-btn').disabled = false;
                return;
            }

            const subject = `[PHIẾU ${voucherType.toUpperCase()}] Yêu cầu phê duyệt - ${voucherNumber}`;
            
            // Placeholder for actual approval/rejection links. In a real system, these would point to a backend endpoint
            // that updates the voucher status and potentially triggers further actions.
            const approvalLink = `https://your-app.com/approve?voucherId=${voucherNumber}&status=approved`;
            const rejectionLink = `https://your-app.com/approve?voucherId=${voucherNumber}&status=rejected`;

            const emailBodyHtml = `
                <p>Kính gửi các cấp quản lý,</p>
                <p>Phiếu <b>${voucherType}</b> số <b>${voucherNumber}</b> đã được tạo và đang chờ phê duyệt.</p>
                <p><b>Thông tin chi tiết phiếu:</b></p>
                <ul>
                    <li><b>Loại phiếu:</b> ${voucherType}</li>
                    <li><b>Số phiếu:</b> ${voucherNumber}</li>
                    <li><b>Ngày lập:</b> ${voucherDate}</li>
                    <li><b>Công ty:</b> ${companyName}</li>
                    <li><b>Người đề nghị:</b> ${requestorName} (${requestorEmail || 'Không có email'})</li>
                    <li><b>Bộ phận:</b> ${department}</li>
                    <li><b>Người nộp/nhận:</b> ${payeeName}</li>
                    <li><b>Tổng số tiền:</b> ${totalAmount}</li>
                    <li><b>Số tiền bằng chữ:</b> ${amountInWords}</li>
                    <li><b>Lý do:</b> ${reason}</li>
                </ul>
                <p><b>Chi tiết các khoản mục:</b></p>
                <table style="width:100%; border-collapse: collapse; border: 1px solid #ddd;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">STT</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Nội dung</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Số tiền</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Đính kèm</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expenseItems.map((item, index) => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${item.content}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.amount)}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${item.attachments.map(file => file.name).join(', ') || 'Không có'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p>Vui lòng xem xét và phê duyệt/từ chối phiếu này:</p>
                <p>
                    <a href="${approvalLink}" style="background-color: #34A853; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Phê duyệt</a>
                    <a href="${rejectionLink}" style="background-color: #EA4335; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Từ chối</a>
                </p>
                <p>Trân trọng,<br>Hệ thống Kế toán Tự động</p>
            `;

            const payload = {
                action: 'sendApprovalEmail',
                email: {
                    to: recipients.join(','),
                    cc: ccRecipients.join(','),
                    subject: subject,
                    body: emailBodyHtml
                }
            };

            try {
                const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Required for simple POST to Apps Script without preflight
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                // Since mode: 'no-cors' is used, response.ok will always be false.
                // We rely on the Apps Script to actually send the email and assume success
                // if no network error occurs. For a more robust solution, the Apps Script
                // should return a JSON response and the client should handle CORS.
                // For this example, we'll assume success if the fetch completes without error.

                // Update UI status and history
                document.getElementById('approval-status-display').textContent = 'Đã gửi phê duyệt';
                document.getElementById('approval-status-display').classList.remove('status-pending', 'status-rejected');
                document.getElementById('approval-status-display').classList.add('status-approved');

                const now = new Date();
                const timestamp = now.toLocaleString('vi-VN');
                approvalHistory.push({
                    timestamp: timestamp,
                    action: 'Gửi yêu cầu phê duyệt',
                    by: requestorName,
                    to: [selectedApproverName, selectedCompanyData ? selectedCompanyData["Đại diện pháp luật"] : '', selectedCompanyData ? selectedCompanyData["Kế toán trưởng"] : ''].filter(Boolean).join(', ')
                });
                renderApprovalHistory();

                showToast(`Đã gửi yêu cầu phê duyệt cho ${recipients.join(', ')}`, 'success', 'Gửi thành công');

            } catch (error) {
                console.error('Lỗi khi gửi yêu cầu phê duyệt qua Google Apps Script:', error);
                showToast('Không thể gửi yêu cầu phê duyệt tự động. Đang chuyển sang gửi qua email client', 'warning', 'Cảnh báo');
                
                // Fallback to mailto: if webhook fails
                const mailtoLink = `mailto:${recipients.join(',')}?cc=${ccRecipients.join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBodyHtml.replace(/<[^>]*>?/gm, ''))}`; // Remove HTML for mailto body
                window.open(mailtoLink, '_blank');
            } finally {
                loadingIndicator.classList.remove('show');
                document.getElementById('send-approval-btn').disabled = false;
            }
        }

        function renderApprovalHistory() {
            const historyList = document.getElementById('approval-history-list');
            historyList.innerHTML = '';

            if (approvalHistory.length === 0) {
                historyList.innerHTML = '<li>Chưa có yêu cầu phê duyệt nào được gửi.</li>';
                return;
            }

            approvalHistory.forEach(entry => {
                const listItem = document.createElement('li');
                listItem.textContent = `${entry.timestamp}: ${entry.action} bởi ${entry.by} (gửi đến: ${entry.to})`;
                historyList.appendChild(listItem);
            });
        }

        // Expense Table Functions
        function renderExpenseTable() {
            const tableBody = document.getElementById('expense-table-body');
            tableBody.innerHTML = '';

            expenseItems.forEach((item, index) => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><input type="text" value="${item.content || ''}" oninput="updateExpenseItem(${index}, 'content', this.value)"></td>
                    <td><input type="text" value="${formatCurrency(item.amount || 0)}" oninput="updateExpenseItem(${index}, 'amount', parseCurrency(this.value))" onblur="this.value = formatCurrency(parseCurrency(this.value))"></td>
                    <td class="attachment-cell">
                        <button type="button" class="attachment-button" onclick="triggerAttachmentInput(${index})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                            Đính kèm (${item.attachments.length})
                        </button>
                        <input type="file" multiple class="hidden" id="attachment-input-${index}" onchange="handleRowFileSelect(event, ${index})">
                        <div class="file-list" id="file-list-${index}">
                            ${item.attachments.map(file => `<p>${file.name}</p>`).join('')}
                        </div>
                    </td>
                    <td><button type="button" class="remove-row-btn" onclick="removeExpenseRow(${index})">&times;</button></td>
                `;
            });
            updateGrandTotal();
        }

        function addExpenseRow() {
            expenseItems.push({ content: '', amount: 0, attachments: [] });
            renderExpenseTable();
            debounceAutoSave();
        }

        async function removeExpenseRow(index) {
            const confirmed = await showConfirmation(
                'Bạn có chắc chắn muốn xóa dòng này không?',
                'Xác nhận xóa'
            );
            
            if (confirmed) {
                expenseItems.splice(index, 1);
                renderExpenseTable();
                debounceAutoSave();
                showToast('Đã xóa dòng thành công', 'success');
            }
        }

        function updateExpenseItem(index, field, value) {
            expenseItems[index][field] = value;
            if (field === 'amount') {
                updateGrandTotal();
            }
            debounceAutoSave();
        }

        function triggerAttachmentInput(index) {
            document.getElementById(`attachment-input-${index}`).click();
        }

        function handleRowFileSelect(event, index) {
            const files = Array.from(event.target.files);
            const validFiles = [];
            let hasError = false;
            
            files.forEach(file => {
                if (validateFile(file)) {
                    validFiles.push(file);
                } else {
                    hasError = true;
                }
            });
            
            if (validFiles.length > 0) {
                expenseItems[index].attachments = validFiles;
                renderExpenseTable();
                debounceAutoSave();
                if (validFiles.length === files.length) {
                    showToast(`Đã thêm ${validFiles.length} file thành công`, 'success');
                } else {
                    showToast(`Đã thêm ${validFiles.length}/${files.length} file`, 'warning');
                }
            } else if (!hasError) {
                expenseItems[index].attachments = [];
                renderExpenseTable();
            }
        }

        function updateGrandTotal() {
            const grandTotal = expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0);
            document.getElementById('grand-total').textContent = formatCurrency(grandTotal);
            document.getElementById('amount').value = formatCurrency(grandTotal);
            updateAmountInWords();
        }

        function formatCurrency(amount) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        }

        function parseCurrency(currencyString) {
            const cleanedString = currencyString.replace(/[^0-9,.]/g, '');
            const parts = cleanedString.split(',');
            if (parts.length > 1) {
                const lastPart = parts[parts.length - 1];
                if (lastPart.length <= 3 && lastPart.includes('.')) { 
                    return parseFloat(cleanedString.replace(/\./g, '').replace(',', '.'));
                } else if (lastPart.length <= 3 && !lastPart.includes('.')) { 
                    return parseFloat(cleanedString.replace(/,/g, ''));
                }
            }
            return parseFloat(cleanedString.replace(/\./g, '').replace(',', '.')) || 0;
        }

        async function copyFromExcelToTable() {
            try {
                const text = await navigator.clipboard.readText();
                const lines = text.split('\n').filter(line => line.trim() !== '');
                
                if (lines.length === 0) {
                    alert('Không có dữ liệu để dán từ clipboard.');
                    return;
                }

                const newItems = [];
                lines.forEach(line => {
                    const parts = line.split('\t');
                    if (parts.length >= 2) {
                        const content = parts[0] || '';
                        const amount = parseCurrency(parts[1]) || 0;
                        newItems.push({ content, amount, attachments: [] });
                    }
                });

                if (newItems.length > 0) {
                    expenseItems = newItems;
                    renderExpenseTable();
                    debounceAutoSave();
                    showToast('Đã dán dữ liệu từ Excel vào bảng chi tiết thành công!', 'success', 'Thành công');
                } else {
                    showToast('Không thể phân tích dữ liệu dán. Vui lòng đảm bảo định dạng là "Nội dung\\tSố tiền"', 'error', 'Lỗi');
                }

            } catch (err) {
                console.error('Failed to read clipboard contents: ', err);
                showToast('Không thể truy cập clipboard. Vui lòng đảm bảo bạn đã cấp quyền cho trình duyệt hoặc thử nhập từ file', 'error', 'Lỗi');
            }
        }

        function importExcelToTable() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx, .xls';
            
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                    if (jsonData.length > 1) {
                        const newItems = [];
                        for (let i = 1; i < jsonData.length; i++) {
                            const row = jsonData[i];
                            if (row.length >= 2) {
                                const content = row[0] || '';
                                const amount = parseFloat(row[1]) || 0;
                                newItems.push({ content, amount, attachments: [] });
                            }
                        }

                        if (newItems.length > 0) {
                            expenseItems = newItems;
                            renderExpenseTable();
                            debounceAutoSave();
                            showToast('Đã nhập dữ liệu từ file Excel vào bảng chi tiết thành công!', 'success', 'Thành công');
                        } else {
                            showToast('Không tìm thấy dữ liệu hợp lệ trong file Excel. Vui lòng đảm bảo file có các cột "Nội dung", "Số tiền"', 'error', 'Lỗi');
                        }
                    } else {
                        showToast('File Excel trống hoặc không có dữ liệu', 'error', 'Lỗi');
                    }
                };
                reader.readAsArrayBuffer(file);
            });
            
            input.click();
        }

        /*
         * Google Apps Script (Code.gs) for sending emails:
         *
         * Instructions:
         * 1. Go to script.google.com and create a new project.
         * 2. Copy the following code into the Code.gs file.
         * 3. Save the project.
         * 4. Deploy the script as a Web App:
         *    - Click "Deploy" -> "New deployment".
         *    - Select "Web app" as the type.
         *    - Set "Execute as" to "Me" (your Google account).
         *    - Set "Who has access" to "Anyone".
         *    - Click "Deploy".
         *    - Authorize the script if prompted (it will ask for permission to send emails on your behalf).
         *    - Copy the "Web app URL" and replace 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' in the HTML with this URL.
         * 5. Test the integration by filling out the form and clicking "Gửi phê duyệt".
         */
        /*
        function doPost(e) {
            try {
                const requestBody = JSON.parse(e.postData.contents);
                const action = requestBody.action;

                if (action === 'sendApprovalEmail') {
                    const emailData = requestBody.email;
                    const to = emailData.to;
                    const cc = emailData.cc;
                    const subject = emailData.subject;
                    const body = emailData.body;

                    GmailApp.sendEmail(to, subject, '', {
                        htmlBody: body,
                        cc: cc
                    });

                    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Email sent successfully.' }))
                        .setMimeType(ContentService.MimeType.JSON);
                } else {
                    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action.' }))
                        .setMimeType(ContentService.MimeType.JSON);
                }
            } catch (error) {
                return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.message }))
                    .setMimeType(ContentService.MimeType.JSON);
            }
        }
        */
