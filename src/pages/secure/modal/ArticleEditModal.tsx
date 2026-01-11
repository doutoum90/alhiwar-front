import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import type { ArticleStatus } from "../../../types";
import MediaManagerPro from "../../common/MediaManagerPro";
import AuthorsPicker from "../../common/AuthorsPicker";
import CommentsPanel from "../../common/CommentsPanel";
import { RichEditor } from "./RichEditor";
import type { ArticleProps } from "../../../types";

export default function ArticleEditModal({
  isOpen,
  onClose,
  loadingArticle,
  saving,
  articleId,
  form,
  setForm,
  categories,
  allowedStatuses,
  rightMetaSlot,
  onSave,
  onPreview,
}: ArticleProps) {
  const isEdit = !!articleId;
  const statusOptions = allowedStatuses ?? ['draft', 'in_review', 'published', 'archived', 'rejected'];

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEdit ? "Modifier l'article" : "Créer un article"}</ModalHeader>
        <ModalCloseButton disabled={!!saving} />
        <ModalBody>
          {loadingArticle ? (
            <Flex py={10} justify="center">
              <Spinner />
            </Flex>
          ) : (
            <VStack spacing={5} align="stretch">
              <HStack spacing={4} align="start">
                <Box flex="2">
                  <FormControl isRequired>
                    <FormLabel>Titre</FormLabel>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de l'article" />
                  </FormControl>

                  <FormControl mt={4} isRequired>
                    <FormLabel>Extrait</FormLabel>
                    <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Résumé court" rows={4} />
                  </FormControl>

                  <FormControl mt={4} isRequired>
                    <FormLabel>Contenu (éditeur avancé)</FormLabel>
                    <RichEditor value={form.contentHtml} onChange={(v) => setForm({ ...form, contentHtml: v })} />
                  </FormControl>
                </Box>

                <Box flex="1">
                  <Card borderRadius="2xl">
                    <CardBody>
                      <Heading size="sm" mb={3}>
                        Meta
                      </Heading>

                      <FormControl>
                        <FormLabel>Catégorie</FormLabel>
                        <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} placeholder="Sélectionner">
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl mt={3}>
                        <FormLabel>Statut</FormLabel>
                        <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ArticleStatus })}>
                          {statusOptions.includes("draft") ? <option value="draft">Brouillon</option> : null}

                          {statusOptions.includes("in_review") ? <option value="in_review">En review</option> : null}

                          {statusOptions.includes("published") ? <option value="published">PubliǸ</option> : null}

                          {statusOptions.includes("archived") ? <option value="archived">ArchivǸ</option> : null}

                          {statusOptions.includes("rejected") ? <option value="rejected">RejetǸ</option> : null}
                        </Select>
                      </FormControl>

                      <FormControl mt={3}>
                        <FormLabel>Tags (virgules)</FormLabel>
                        <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="politique, économie, tech" />
                      </FormControl>

                      <Divider my={4} />

                      {isEdit ? rightMetaSlot : <Text fontSize="sm" color="gray.500">Les likes seront disponibles après création.</Text>}
                    </CardBody>
                  </Card>
                </Box>
              </HStack>

              {isEdit ? (
                <Tabs variant="enclosed" colorScheme="teal">
                  <TabList>
                    <Tab>Médias</Tab>
                    <Tab>Auteurs</Tab>
                    <Tab>Commentaires</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel px={0}>
                      <MediaManagerPro articleId={articleId!} />
                    </TabPanel>
                    <TabPanel px={0}>
                      <AuthorsPicker articleId={articleId!} />
                    </TabPanel>
                    <TabPanel px={0}>
                      <CommentsPanel articleId={articleId!} />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              ) : (
                <Text color="gray.500">Clique sur “Créer” pour activer Médias / Auteurs / Commentaires.</Text>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={!!saving}>
            Fermer
          </Button>

          {isEdit && onPreview ? (
            <Button variant="outline" mr={3} onClick={onPreview} isDisabled={!!saving}>
              Prévisualiser
            </Button>
          ) : null}

          <Button colorScheme="teal" onClick={onSave} isLoading={!!saving}>
            {isEdit ? "Mettre à jour" : "Créer"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


