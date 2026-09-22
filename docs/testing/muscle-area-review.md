# Draft muscle-to-area assignments — #45

Status: anatomical and sponsor review pending. Do not close #45 yet.

The explicit table in src/muscle-area-assignments.mjs uses original GLB base names, shared by the left and right catalog records. The mapper preserves the original records and mesh references. A muscle may appear in more than one area. The user selected physical location only. Muscles are not assigned to a distant joint simply because they move it. Some muscles span regions, so shared membership still needs anatomical review. It is not a diagnosis or a pain-source prediction.

General anatomy references used for orientation (the product-specific assignments are a draft interpretation, not a classification prescribed by these sources):

- [OpenStax: head, neck and back](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back)
- [OpenStax: shoulder and upper limb](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs)
- [OpenStax: pelvic girdle and lower limb](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs)

## Review required

- Confirm the membership lists below, including muscles assigned to multiple areas.
- Review every unassigned name. Decide whether to map it or explicitly document it as outside this version's ten areas. No exclusions have been silently inferred for those muscle records.
- Resolve generic names such as Rotatores and internal head/neck/trunk structures rather than guessing from model coordinates.
- Confirm physical region boundaries, particularly whether Anconeus counts as Elbow, Popliteus as Knee, Pronator quadratus as Wrist/Hand, and distal Fibularis tertius as Ankle. The ankle candidate lies in the distal leg near the ankle; if the product defines ankle strictly at the joint, remove it rather than force a nonempty list.
- Confirm which internal pharyngeal/laryngeal muscles belong in the client-facing Neck area.
- Thigh, proximal forearm, calf, face, abdomen, and pelvic-floor muscles without a supported physical region remain unassigned; these are not silently deleted or labeled as non-muscle anatomy.
- The previous coordinate zones are not used here: model bounds can put nearby hand objects into a hip zone. #47's visual boundaries need a separate review.

## Implementation and tests

The viewer builds these groups from Girwan's muscle-only catalog after loading. getMusclesForArea(areaId) returns a copy of the area's array for future list UI (#48); this change does not implement that UI or change #47's spatial highlights. One aggregate console warning lists unmapped records. Unknown assignment area IDs throw a configuration error. Tests check exclusions through the catalog pipeline, side preservation, real-model name coverage, nonempty lists, ordering, deduplication, and unknown/unmapped handling.

Run npm run report:muscle-areas to display current counts. Regenerate this review worksheet with npm run report:muscle-areas -- --write (overwrites this generated worksheet; keep reviewer decisions separately). Run npm run test:body-map, npm run lint:html, and npm run test:browser (see body-area-progress.md for Chrome setup). Tests demonstrate software behavior, not anatomical approval.

## neck (93 side-specific records)

- [ ] Anterior Belly Of Digastric Muscle
- [ ] Ary-Epiglottic Part Of Oblique Arytenoid Muscle
- [ ] Descending Part Of Trapezius Muscle
- [ ] External Part Of Thyro-Arytenoid Muscle
- [ ] Geniohyoid Muscle
- [ ] Iliocostalis Colli Muscle
- [ ] Inferior Pharyngeal Constrictor
- [ ] Interspinales Colli Muscles
- [ ] Lateral Crico-Arytenoid Muscle
- [ ] Levator Scapulae
- [ ] Longissimus Capitis Muscle
- [ ] Longissimus Colli Muscle
- [ ] Longus Capitis Muscle
- [ ] Longus Colli Muscle
- [ ] Middle Pharyngeal Constrictor
- [ ] Multifidus Colli Muscle
- [ ] Mylohyoid Muscle
- [ ] Oblique Part Of Cricothyroid Muscle
- [ ] Obliquus Inferior Capitis Muscle
- [ ] Obliquus Superior Capitis Muscle
- [ ] Omohyoid Muscle
- [ ] Palatopharyngeus Muscle
- [ ] Platysma
- [ ] Posterior Belly Of Digastric Muscle
- [ ] Posterior Crico-Arytenoid Muscle
- [ ] Rectus Anterior Capitis Muscle
- [ ] Rectus Lateralis Capitis Muscle
- [ ] Rectus Posterior Major Capitis Muscle
- [ ] Rectus Posterior Minor Capitis Muscle
- [ ] Scalenus Anterior Muscle
- [ ] Scalenus Medius Muscle
- [ ] Scalenus Posterior Muscle
- [ ] Semispinalis Colli Muscle
- [ ] Spinalis Capitis Muscle
- [ ] Spinalis Colli Muscle
- [ ] Splenius Capitis Muscle
- [ ] Splenius Colli Muscle
- [ ] Sternocleidomastoid Muscle
- [ ] Sternohyoid Muscle
- [ ] Sternothyroid Muscle
- [ ] Straight Part Of Cricothyroid Muscle
- [ ] Stylohyoid Muscle
- [ ] Stylopharyngeus Muscle
- [ ] Superior Pharyngeal Constrictor
- [ ] Thyro-Epiglottic Part Of Thyro-Arytenoid Muscle
- [ ] Thyrohyoid Muscle
- [ ] Transverse Arytenoid Muscle

## shoulder (18 side-specific records)

- [ ] Acromial Part Of Deltoid Muscle
- [ ] Clavicular Part Of Deltoid Muscle
- [ ] Infraspinatus Muscle
- [ ] Scapular Spinal Part Of Deltoid Muscle
- [ ] Subclavius Muscle
- [ ] Subscapularis Muscle
- [ ] Supraspinatus Muscle
- [ ] Teres Major Muscle
- [ ] Teres Minor Muscle

## upper-back (32 side-specific records)

- [ ] Ascending Part Of Trapezius Muscle
- [ ] Descending Part Of Trapezius Muscle
- [ ] Iliocostalis Thoracis Muscle
- [ ] Interspinales Thoracis Muscles
- [ ] Latissimus Dorsi Muscle
- [ ] Levator Scapulae
- [ ] Levatores Breves Costarum
- [ ] Levatores Longi Costarum
- [ ] Longissimus Thoracis Muscle
- [ ] Multifidus Thoracis Muscle
- [ ] Rhomboid Major Muscle
- [ ] Rhomboid Minor Muscle
- [ ] Semispinalis Thoracis Muscle
- [ ] Serratus Posterior Superior Muscle
- [ ] Spinalis Thoracis Muscle
- [ ] Transverse Part Of Trapezius Muscle

## lower-back (14 side-specific records)

- [ ] Dorsal Parts Of Lateral Intertransversarii Lumborum Muscles
- [ ] Iliocostalis Lumborum Muscle
- [ ] Interspinales Lumborum Muscles
- [ ] Multifidus Lumborum Muscle
- [ ] Quadratus Lumborum Muscle
- [ ] Serratus Posterior Inferior Muscle
- [ ] Ventral Parts Of Lateral Intertransversarii Lumborum Muscles

## elbow (2 side-specific records)

- [ ] Anconeus Muscle

## wrist-hand (26 side-specific records)

- [ ] Abductor Digiti Minimi Of Hand
- [ ] Abductor Pollicis Brevis
- [ ] Deep Head Of Flexor Pollicis Brevis
- [ ] Dorsal Interossei Muscles Of Hand
- [ ] Flexor Digiti Minimi Of Hand
- [ ] Lumbrical Muscles Of Hand
- [ ] Oblique Head Of Adductor Pollicis
- [ ] Opponens Digiti Minimi Muscle Of Hand
- [ ] Opponens Pollicis Muscle
- [ ] Palmar Interossei Muscles
- [ ] Pronator Quadratus
- [ ] Superficial Head Of Flexor Pollicis Brevis
- [ ] Transverse Head Of Adductor Pollicis

## hip (22 side-specific records)

- [ ] Gluteus Maximus Muscle
- [ ] Gluteus Medius Muscle
- [ ] Gluteus Minimus Muscle
- [ ] Iliacus Muscle
- [ ] Inferior Gemellus Muscle
- [ ] Obturator Externus
- [ ] Obturator Internus
- [ ] Piriformis Muscle
- [ ] Quadratus Femoris Muscle
- [ ] Superior Gemellus Muscle
- [ ] Tensor Fasciae Latae

## knee (2 side-specific records)

- [ ] Popliteus Muscle

## ankle (2 side-specific records)

- [ ] Fibularis Tertius Muscle

## foot (30 side-specific records)

- [ ] (Opponens Digiti Minimi Muscle Of Foot)
- [ ] Abductor Digiti Minimi Of Foot
- [ ] Abductor Hallucis
- [ ] Dorsal Interossei Muscles Of Foot
- [ ] Extensor Digitorum Brevis
- [ ] Extensor Hallucis Brevis
- [ ] Flexor Digiti Minimi Of Foot
- [ ] Flexor Digitorum Brevis
- [ ] Lateral Head Of Flexor Hallucis Brevis
- [ ] Lumbrical Muscles Of Foot
- [ ] Medial Head Of Flexor Hallucis Brevis
- [ ] Oblique Head Of Adductor Hallucis
- [ ] Plantar Interossei Muscles
- [ ] Quadratus Plantae Muscle
- [ ] Transverse Head Of Adductor Hallucis

## Unassigned names

- [ ] (Abdominal Part Of Pectoralis Major Muscle)
- [ ] (Adductor Minimus)
- [ ] Abductor Pollicis Longus
- [ ] Adductor Brevis
- [ ] Adductor Longus
- [ ] Adductor Magnus
- [ ] Brachialis Muscle
- [ ] Brachioradialis Muscle
- [ ] Bucinator
- [ ] Clavicular Head Of Pectoralis Major Muscle
- [ ] Coccygeus Muscle
- [ ] Coracobrachialis Muscle
- [ ] Corrugator Supercilii
- [ ] Deep Head Of Pronator Teres
- [ ] Deep Part Of Masseter
- [ ] Depressor Anguli Oris
- [ ] Depressor Labii Inferioris
- [ ] Depressor Septi Nasi
- [ ] Diaphragm
- [ ] Extensor Carpi Radialis Brevis
- [ ] Extensor Carpi Radialis Longus
- [ ] Extensor Digiti Minimi
- [ ] Extensor Digitorum
- [ ] Extensor Digitorum Longus
- [ ] Extensor Hallucis Longus
- [ ] Extensor Indicis
- [ ] Extensor Pollicis Brevis
- [ ] Extensor Pollicis Longus
- [ ] External Abdominal Oblique Muscle
- [ ] External Anal Sphincter
- [ ] External Intercostal Muscles
- [ ] Fibularis Brevis Muscle
- [ ] Fibularis Longus Muscle
- [ ] Flexor Carpi Radialis
- [ ] Flexor Digitorum Longus
- [ ] Flexor Digitorum Profundus
- [ ] Flexor Hallucis Longus
- [ ] Flexor Pollicis Longus
- [ ] Frontalis Muscle
- [ ] Genioglossus Muscle
- [ ] Gracilis Muscle
- [ ] Humeral Head Of Extensor Carpi Ulnaris
- [ ] Humeral Head Of Flexor Carpi Ulnaris
- [ ] Humero-Ulnar Head Of Flexor Digitorum Superficialis
- [ ] Hyoglossus Muscle
- [ ] Iliococcygeus Muscle
- [ ] Inferior Head Of Lateral Pterygoid Muscle
- [ ] Inferior Oblique Muscle
- [ ] Inferior Rectus Muscle
- [ ] Innermost Intercostal Muscles
- [ ] Internal Abdominal Oblique Muscle
- [ ] Internal Intercostal Muscles
- [ ] Lateral Head Of Gastrocnemius
- [ ] Lateral Head Of Triceps Brachii
- [ ] Lateral Rectus Muscle
- [ ] Levator Anguli Oris
- [ ] Levator Labii Superioris
- [ ] Levator Nasolabialis
- [ ] Levator Palpebrae Superioris
- [ ] Long Head Of Biceps Brachii
- [ ] Long Head Of Biceps Femoris
- [ ] Long Head Of Triceps Brachii
- [ ] Medial Head Of Gastrocnemius
- [ ] Medial Head Of Triceps Brachii
- [ ] Medial Pterygoid Muscle
- [ ] Medial Rectus Muscle
- [ ] Mentalis Muscle
- [ ] Nasalis Muscle
- [ ] Occipitalis Muscle
- [ ] Orbicularis Oris Muscle
- [ ] Orbital Part Of Orbicularis Oculi
- [ ] Palmaris Longus Muscle
- [ ] Palpebral Part Of Orbicularis Oculi
- [ ] Pectineus Muscle
- [ ] Pectoralis Minor Muscle
- [ ] Plantaris Muscle
- [ ] Procerus Muscle
- [ ] Psoas Major
- [ ] Pubo-Analis Muscle
- [ ] Pubococcygeus Muscle
- [ ] Pyramidalis Muscle
- [ ] Radial Head Of Flexor Digitorum Superficialis
- [ ] Rectus Abdominis Muscle
- [ ] Rectus Femoris Muscle
- [ ] Risorius Muscle
- [ ] Rotatores
- [ ] Sartorius Muscle
- [ ] Semimembranosus Muscle
- [ ] Semitendinosus Muscle
- [ ] Serratus Anterior Muscle
- [ ] Short Head Of Biceps Brachii
- [ ] Short Head Of Biceps Femoris
- [ ] Soleus Muscle
- [ ] Sternocostal Head Of Pectoralis Major Muscle
- [ ] Superficial Head Of Pronator Teres
- [ ] Superficial Part Of Masseter
- [ ] Superior Head Of Lateral Pterygoid Muscle
- [ ] Superior Oblique Muscle
- [ ] Superior Rectus Muscle
- [ ] Supinator
- [ ] Temporalis Muscle
- [ ] Temporoparietalis Muscle
- [ ] Tibialis Anterior Muscle
- [ ] Tibialis Posterior Muscle
- [ ] Transversus Abdominis Muscle
- [ ] Transversus Thoracis Muscle
- [ ] Ulnar Head Of Extensor Carpi Ulnaris
- [ ] Ulnar Head Of Flexor Carpi Ulnaris
- [ ] Vastus Intermedius Muscle
- [ ] Vastus Lateralis Muscle
- [ ] Vastus Medialis Muscle
- [ ] Zygomaticus Major Muscle
- [ ] Zygomaticus Minor Muscle
