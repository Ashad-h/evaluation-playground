# Guide de la playground d’évaluation

## Comment importer un nouveau jeu de données

L'importation d'un nouveau jeu de données est une étape essentielle pour commencer l'évaluation de vos posts LinkedIn. Voici comment procéder:

### Préparation du jeu de données

1. Préparez votre jeu de données au format JSON. Il doit contenir une liste d'objets avec au moins deux champs:
    - Un champ pour le contenu du post (généralement `input`)
    - Un champ pour la valeur attendue (généralement `expectedOutput`)

Exemple de format:

```json
[
  {
    "input": "Contenu du premier post LinkedIn",
    "expectedOutput": true},
  {
    "input": "Contenu du deuxième post LinkedIn",
    "expectedOutput": false}
]

```

### Processus d'importation

1. Cliquez sur le bouton **Import Dataset** pour ouvrir le panneau d'importation
2. Dans le champ **JSON Input**, collez votre jeu de données au format JSON
3. Dans le champ **Input Field Name**, spécifiez le nom du champ contenant le texte du post (par défaut: `input`)
4. Dans le champ **Output Field Name**, spécifiez le nom du champ contenant la valeur attendue (par défaut: `expectedOutput`)
5. Cliquez sur le bouton **Import** pour charger le jeu de données

## Comment étiqueter les éléments dans le jeu de données

Une fois votre jeu de données importé, vous pouvez visualiser et modifier les étiquettes (labels) des éléments:

### Visualisation du jeu de données

1. Le tableau affiche tous les éléments de votre jeu de données avec:
    - Un index (numéro de ligne)
    - Le contenu du post (tronqué pour l'affichage)
    - La valeur attendue (expected output)
    - La valeur prédite (si disponible)
2. Pour voir le contenu complet d'un élément, cliquez sur la ligne correspondante ou sur l'icône de flèche à gauche

### Modification des étiquettes

1. Dans la colonne **Expected Output**, vous pouvez modifier la valeur attendue en cliquant dessus
    - Pour les valeurs booléennes (true/false), un simple clic inverse la valeur
    - L'indicateur visuel change automatiquement (vert pour `true`, rouge pour `false`)
2. Lorsque vous développez un élément, vous pouvez également:
    - Voir le post LinkedIn formaté comme il apparaîtrait sur la plateforme
    - Visualiser l'explication fournie par le modèle (si disponible)
    - Modifier la valeur attendue dans la section détaillée

### Exportation du jeu de données

1. À tout moment, vous pouvez exporter votre jeu de données en cliquant sur le bouton **Export Dataset**
2. Spécifiez un nom de fichier (par défaut: `dataset.json`)
3. Cliquez sur **Export** pour télécharger le fichier JSON contenant votre jeu de données avec toutes les modifications apportées

Cette fonctionnalité est particulièrement utile pour sauvegarder votre travail d'étiquetage ou pour partager votre jeu de données avec d'autres utilisateurs.

## Configuration et lancement d'une évaluation

Le processus d'évaluation vous permet de tester votre modèle d'IA sur votre jeu de données pour évaluer sa performance.

### Configuration de l'évaluation

1. **Clé API OpenAI**
    - Entrez votre clé API OpenAI dans le champ correspondant
    - Cette clé est nécessaire pour accéder aux modèles d'intelligence artificielle
    - Elle reste enregistrée localement pour vos futures sessions
2. **Sélection du modèle**
    - Choisissez le modèle d'IA à utiliser pour l'évaluation dans le menu déroulant
    - Différents modèles offrent des niveaux de performance et de coût variables
    - Les modèles plus récents et plus avancés peuvent offrir de meilleurs résultats mais à un coût plus élevé
3. **Prompt**
    - Rédigez les instructions que le modèle utilisera pour analyser les posts
    - Un prompt bien conçu est essentiel pour obtenir des résultats précis
    - Vous pouvez réutiliser des prompts précédents qui ont donné de bons résultats
4. **Évaluation de la forme**
    - Cochez la case "Évaluer la forme d'un post LinkedIn" pour analyser la structure visuelle des posts
    - Lorsque cette option est activée, deux champs supplémentaires apparaissent:
        - **Nombre minimum de caractères**: définit le nombre minimum de caractères qu'un post doit contenir
        - **Nombre minimum de lignes**: définit le nombre minimum de lignes qu'un post doit contenir

### Lancement de l'évaluation

1. Cliquez sur le bouton **Run Evaluation** pour lancer le processus
2. Durant l'évaluation:
    - Une barre de progression indique l'avancement en pourcentage
    - Le temps écoulé est affiché
    - Vous pouvez annuler l'évaluation à tout moment en cliquant sur le bouton **Cancel**

## Interprétation des résultats

Après l'évaluation, les résultats sont présentés de plusieurs façons:

### Résultats individuels

1. Dans le tableau du jeu de données, chaque élément affiche:
    - La valeur prédite (dans la colonne "Predicted Output")
    - Une couleur verte si la prédiction correspond à la valeur attendue
    - Une couleur rouge si la prédiction est incorrecte
2. En développant un élément du tableau (en cliquant dessus), vous pouvez voir:
    - L'explication fournie par le modèle pour sa décision
    - Une comparaison côte à côte entre la valeur attendue et la valeur prédite

### Métriques globales

Les métriques d'évaluation sont affichées dans le tableau "Metrics History" et comprennent:

1. **Précision (Precision)**
    - Pourcentage de prédictions positives qui sont correctes
    - Formule: Vrais Positifs / (Vrais Positifs + Faux Positifs)
    - Une précision élevée indique que le modèle fait peu d'erreurs quand il prédit "vrai"
2. **Rappel (Recall)**
    - Pourcentage d'éléments positifs réels qui ont été correctement identifiés
    - Formule: Vrais Positifs / (Vrais Positifs + Faux Négatifs)
    - Un rappel élevé indique que le modèle détecte bien la majorité des cas positifs
3. **Score F1**
    - Moyenne harmonique de la précision et du rappel
    - Formule: 2 * (Précision * Rappel) / (Précision + Rappel)
    - Le score F1 est particulièrement utile lorsque les classes sont déséquilibrées
4. **Coût**
    - Coût total de l'évaluation pour l'ensemble du jeu de données
    - Coût moyen pour 100 exemples (utile pour estimer les coûts futurs)

## Utilisation de l'historique des métriques

L'historique des métriques vous permet de comparer les performances de différentes configurations:

1. **Comparaison des runs**
    - Chaque ligne représente une évaluation complète
    - Les meilleures valeurs pour chaque métrique sont affichées en gras
    - Vous pouvez voir l'évolution de vos résultats au fil du temps
2. **Réutilisation des prompts**
    - Pour chaque évaluation, vous pouvez voir le prompt utilisé en cliquant sur l'icône de flèche
    - Le bouton **Use This Prompt** vous permet de réutiliser un prompt précédent
3. **Gestion de l'historique**
    - Le bouton **Reset History** permet de réinitialiser l'historique des métriques
    - Cette action est irréversible et supprimera toutes les données d'évaluation précédentes

## Optimisation des évaluations

Pour améliorer les résultats:

1. **Affinez votre prompt**
    - Testez différentes formulations et instructions
    - Réutilisez les prompts qui ont donné les meilleurs résultats
2. **Comparez différents modèles**
    - Certains modèles peuvent être plus performants pour des tâches spécifiques
    - Évaluez le rapport performance/coût pour choisir le modèle optimal
3. **Équilibrez précision et rappel**
    - Selon votre cas d'usage, vous pourriez privilégier la précision ou le rappel
    - Le score F1 est utile pour trouver un bon équilibre entre les deux

## Champs du formulaire

### Clé API OpenAI

**Description**: Votre clé API personnelle d'OpenAI qui permet d'accéder aux modèles d'intelligence artificielle. Cette clé est nécessaire pour effectuer des requêtes auprès des modèles OpenAI.
**Format**: Chaîne de caractères secrète
**Obligatoire**: Oui

### Sélection du Modèle

**Description**: Le modèle d'IA à utiliser pour l'analyse. Différents modèles offrent différents niveaux de capacité et de coût.
**Format**: Menu déroulant
**Obligatoire**: Oui

### Prompt

**Description**: Les instructions à donner au modèle d'IA. Ce texte détermine comment le modèle analysera les publications.
**Format**: Zone de texte multiligne
**Obligatoire**: Oui

### Évaluer la forme d'un post LinkedIn

**Description**: Lorsque cette option est activée, l'évaluation prendra en compte la forme visuelle du post LinkedIn, pas seulement son contenu textuel.
**Format**: Case à cocher
**Obligatoire**: Non (désactivé par défaut)

### Nombre minimum de caractères

**Description**: Définit le nombre minimum de caractères qu'un post doit contenir pour être évalué positivement. Si un post contient moins de caractères que ce nombre, il sera automatiquement considéré comme "faux" sans être évalué par le modèle d'IA.
**Format**: Nombre entier
**Obligatoire**: Non (0 par défaut, ce qui signifie qu'aucun minimum n'est appliqué)
**Usage**: Utilisé uniquement lorsque "Évaluer la forme d'un post LinkedIn" est activé

### Nombre minimum de lignes @Eliot Hallak ici

**Description**: Définit le nombre minimum de lignes qu'un post doit contenir pour être évalué positivement. Si un post contient moins de lignes que ce nombre, il sera automatiquement considéré comme "faux" sans être évalué par le modèle d'IA. **Le comptage des lignes est basé sur les lignes visuelles rendues dans le post LinkedIn. Donc toutes les lignes sont comptés, même les lignes vides. (voir exemple)**
**Format**: Nombre entier
**Obligatoire**: Non (0 par défaut, ce qui signifie qu'aucun minimum n'est appliqué)
**Usage**: Utilisé uniquement lorsque "Évaluer la forme d'un post LinkedIn" est activé

**Exemple**:

![image.png](Guide%20de%20la%20playground%20d%E2%80%99e%CC%81valuation%201ba68ed0d2788092954bef6d807d57ee/image.png)