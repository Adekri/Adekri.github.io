V tomto adresáři se nachází propojené assety pro simulaci přihlašování na SharePoint.

Uživatel je nejprve odkázán na přihlašovací formulář Microsoft (microsoft-login) odkud je následně přesměrován na přihlašování VUT (vut-login). Pro přihlášení na VUT je možné využít jak otisk prstu tak TOTP kódy, proto je zde také adresář se zalogovaným telefonem (telefon-logged), kde je již TOTP přidané.

Po úspěšném přihlášení na VUT je uživatel přesměrován zpět na Microsoft přihlášení, kde je dotazován, jestli chce přihlášení uložit -- cílem tohoto úkolu je mimo jiné vysvětlit uživateli, proč tato volba není vhodná.