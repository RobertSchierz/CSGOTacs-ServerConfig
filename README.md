## Beschreibung

Node.js Server zur Gruppenverwaltung und Echtzeitübertragung von Pixelkoordinaten und Benutzerinformationen über ein Socket.

## Code Beispiele



## Installation



## API-Referenz

Die Hauptpunkte entsprechen den Anfragen an den Server, die eingerückten Punkte den Antworten an den Client. Das dazugehörige JSON zeigt die erwarteten bzw. die zurückgegebenen Werte.

###reg
Registrierung eines Benutzers
> * reg  
> ``` 
> {  
>     'user' : 'Benutzername',  
>     'pw' : 'Passwort'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'regSuccess' ODER 'regFailed',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###auth
Login eines Benutzers
> * auth  
> ``` 
> {  
>     'user' : 'Benutzername',  
>     'pw' : 'Passwort'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'authSuccess' ODER 'authFailed',  
>>     'user' : 'Benutzername (nur bei 'authSuccess')',  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###createMap
Speichern einer Taktik
> * createMap  
> ``` 
> {  
>     'id' : 'Vom Client vergebene ID',  
>     'user' : 'Benutzername',  
>     'map' : 'Name der Map',  
>     'name' : 'Name der Taktik',  
>     'group' : 'Gruppenname (Falls Gruppentaktik)',  
>     'drag' : '[] Bestimmt für jede Koordinate ob sie Punkt oder Teil einer Linie ist',  
>     'x' : '[] X-Koordinaten',  
>     'y' : '[] Y-Koordinaten'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'createMapSuccess' ODER 'createMapFailed',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###changeMap
Namen einer Taktik ändern
> * changeMapName  
> ``` 
> {  
>     'id' : 'ID der Taktik',  
>     'name' : 'Neuer Name der Taktik'
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'changeMapSuccess' ODER 'changeMapFailed',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###deleteMap
Löschen einer Taktik
> * deleteMap  
> ``` 
> {  
>     'id' : 'ID der Taktik'
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'deleteMapSuccess' ODER 'deleteMapFailed',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###getMaps
Gibt dem Client alle vom Benutzer gespeicherten Taktiken zurück
> * getMaps  
> ``` 
> {  
>     'user' : 'Benutzername'  
>     ODER  
>     'group' : 'Gruppenname'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'provideMaps',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : [{  
>>         'id' : 'Vom Client vergebene ID',  
>>         'map' : 'Name der Map',  
>>         'name' : 'Name der Taktik',  
>>         'group' : 'Name der Gruppe (Falls Gruppentaktik)',  
>>         'drag' : '[] Bestimmt für jede Koordinate ob sie Punkt oder Teil einer Linie ist',  
>>         'x' : '[] X-Koordinaten',  
>>         'y' : '[] Y-Koordinaten'  
>>     }],  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###createGroup
Registrierung einer Gruppe
> * createGroup  
> ``` 
> {  
>     'user' : 'Erstellender Benutzer',  
>     'name' : 'Gruppenname',  
>     'pw' : 'Gruppenpasswort'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'createGroupSuccess' ODER 'createGroupFailed',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###authGroup
Einer Gruppe beitreten
> * authGroup  
> ``` 
> {  
>     'user' : 'Beitretender Benutzer',  
>     'name' : 'Gruppenname',  
>     'pw' : 'Gruppenpasswort'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'authGroupSuccess' ODER 'authGroupFailed',  
>>     'user' : null,  
>>     'member' : '[] Gruppenmitglieder (nur bei 'authGroupSuccess')',  
>>     'admin' : 'Guppenadministrator (nur bei 'authGroupSuccess')',  
>>     'mods' : '[] Gruppenmoderatoren (nur bei 'authGroupSuccess')',  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###getGroups
Gibt dem Client alle Gruppen des Benutzers zurück
> * getGroups  
> ``` 
> {  
>     'user' : 'Benutzername'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'provideGroups',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : [{  
>>         'name' : 'Gruppenname',  
>>         'member' : '[] Gruppenmitglieder',  
>>         'admin' : 'Guppenadministrator',  
>>         'mods' : '[] Gruppenmoderatoren'  
>>     }],  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###leaveGroup
Eine Gruppe verlassen
> * leaveGroup  
> ``` 
> {  
>     'user' : 'Benutzername',  
>     'name' : 'Gruppenname'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'leaveGroupSuccess' ODER 'leaveGroupFailed',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'Gruppenname',  
>>     'groups' : null  
>> }  
>> ``` 
  
###setGroupMod
Einen Benutzer zum Moderator machen
> * setGroupMod  
> ``` 
> {  
>     'user' : 'Name des zum Moderator werdenden Benutzers',  
>     'name' : 'Gruppenname'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'setGroupModSuccess' ODER 'setGroupModFailed',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###kickUser
Einen Benutzer aus einer Gruppe werfen
> * kickUser  
> ``` 
> {  
>     'user' : 'Name des ausführenden Benutzers (muss Admin oder Mod sein)',  
>     'name' : 'Gruppenname',  
>     'kick' : 'Name des zu kickenden Benutzers'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'kickUserSuccess' ODER 'kickUserFailed',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
###deleteGroup
Eine Gruppe löschen
> * deleteGroup  
> ``` 
> {  
>     user : 'Benutzername',  
>     name : 'Gruppenname'  
> }  
> ``` 
  
>> * status  
>> ``` 
>> {  
>>     'status' : 'deleteGroupSuccess' ODER 'deleteGroupFailed',  
>>     'user' : null,  
>>     'member' : null,  
>>     'admin' : null,  
>>     'mods' : null,  
>>     'maps' : null,  
>>     'name' : null,  
>>     'group' : 'null',  
>>     'groups' : null  
>> }  
>> ``` 
  
## Lizenz